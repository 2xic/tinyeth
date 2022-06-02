import { KeyPath } from 'ecies-geth';
import { injectable, METADATA_KEY } from 'inversify';
import { SignatureDeclaration } from 'typescript';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import { Signatures } from '../signatures/Signatures';
import { assertEqual } from '../utils/enforce';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { Logger } from '../utils/Logger';
import { xor } from '../utils/XorBuffer';
import { EncodeAckEip8 } from './auth/EncodeAckEip8';
import { FrameCommunication } from './auth/frameing/FrameCommunication';
import { Auth8Eip } from './AuthEip8';
import { Packet, RlpxPacketTypes } from './Packet';
import { Rlpx } from './Rlpx';

/**
 * TODO: this class is becoming a bit big, and it has a lot of state that could be extracted.
 * Move it out.
 */
@injectable()
export class CommunicationState {
  constructor(
    private rlpx: Rlpx,
    private keyPair: KeyPair,
    private signatures: Signatures,
    private logger: Logger,
    private ephemeralKeyPair: KeyPair,
    private auth8Eip: Auth8Eip,
    private createAck: EncodeAckEip8
  ) {}

  private nextState: MessageState = MessageState.AUTH;

  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private sentPacket?: Buffer;

  private frameCommunication?: FrameCommunication;

  private remotePublicKey?: string;

  public get publicKey() {
    return this.keyPair.getPublicKey();
  }

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    this.remotePublicKey = publicKey;
  }

  public async sendMessage(
    message: MessageOptions,
    callback: (message: Buffer) => Promise<void>
  ) {
    if (MessageType.AUTH_EIP_8 === message.type) {
      const { results: authMessage, header } =
        // Why have I used keypair here ? It should not be used, and is probably one of the reasons for the bugs :)
        // it's the remote public key that should always be used.
        await this.rlpx.createEncryptedAuthMessageEip8({
          ethNodePublicKey: this.remotePublicKey || this.keyPair.getPublicKey(),
        });

      this._senderNonce = header.nonce;
      this._secret = header.secret;
      this.sentPacket = authMessage;

      this.nextState = MessageState.ACK;
      await callback(authMessage);
    } else if (MessageType.HELLO === message.type) {
      throw new Error('Nono, please go in order ser');
    } else if (MessageType.PING === message.type) {
      await callback(this.encodeMessage(RlpxPacketTypes.PONG));
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  public async parseMessage(
    message: Buffer,
    callback: (message: Buffer) => Promise<void>
  ) {
    this.logger.log(` new data: ${message.toString('hex')}`);
    if (this.nextState === MessageState.AUTH) {
      if (!this.remotePublicKey) {
        throw new Error('opsi');
      }
      const decodedAuthMessage = await this.auth8Eip.decodeAuthEip8({
        input: message,
      });
      const sharedSecret = this.keyPair.getEcdh({
        publicKey: this.remotePublicKey,
      });

      const senderNonce = getBufferFromHex(decodedAuthMessage.nonce);
      const remotePublicKey = this.signatures.getPublicKeyFromSignature({
        message: xor(sharedSecret, senderNonce),
        signature: getBufferFromHex(decodedAuthMessage.signature).slice(0, 64),
        r: getBufferFromHex(decodedAuthMessage.signature)[64],
      });

      const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
        publicKey: remotePublicKey,
      });

      const { results, header } = await this.rlpx.createEncryptedAckMessageEip8(
        {
          ethNodePublicKey: remotePublicKey,
        }
      );
      this.frameCommunication = new FrameCommunication().setup({
        ephemeralSharedSecret: ephemeralSharedSecret,
        initiatorNonce: senderNonce,
        receiverNonce: header.nonce,
        remotePacket: message,
        initiatorPacket: results,
        switchNonce: true,
      });

      await callback(results);
    } else if (this.nextState == MessageState.ACK) {
      if (!this._secret || !this._senderNonce || !this.sentPacket) {
        throw new Error('Something is wrong');
      }
      const { nonce, publicKey }: { nonce: string; publicKey: string } =
        await this.auth8Eip.decodeAckEip8({
          input: message,
        });
      const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
        publicKey,
      });

      const receiverNonce = getBufferFromHex(nonce);

      assertEqual(receiverNonce.length, 32, 'Received nonce length is wrong');
      assertEqual(this._senderNonce.length, 32, 'Nonce length is wrong');

      this.frameCommunication = new FrameCommunication().setup({
        ephemeralSharedSecret: ephemeralSharedSecret,
        initiatorNonce: this._senderNonce,
        receiverNonce: receiverNonce,
        remotePacket: message,
        initiatorPacket: this.sentPacket,
      });
      this.logger.log('Setup frame communication');
      this.nextState = MessageState.PACKETS;
      await callback(Buffer.from([]));
    } else if (this.nextState === MessageState.PACKETS) {
      if (!this.frameCommunication) {
        throw new Error('Missing frame communicator');
      }

      try {
        const body = this.frameCommunication.decode({
          message,
        });
        const packetParser = new Packet();
        const hello = packetParser.parse({
          packet: body,
        });
        if (typeof hello === 'object') {
          this.logger.log('Got a hello ? ');
          const helloMessage = new Packet().encodeHello({
            packet: {
              ...hello,
              nodeId: `0x${this.keyPair.getPublicKey()}`,
            },
          });
          const encodedMessage = this.frameCommunication.encode({
            message: helloMessage,
          });
          await callback(encodedMessage);
        } else if (hello == RlpxPacketTypes.PING) {
          this.logger.log('Got a ping, reply with pong');
          const encodedMessage = this.encodeMessage(RlpxPacketTypes.PONG);
          await callback(encodedMessage);
        } else if (hello == RlpxPacketTypes.PONG) {
          this.logger.log('Got a pong, reply with ping');
        } else {
          this.logger.log('Unknown state ... ');
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  private encodeMessage(code: RlpxPacketTypes.PONG | RlpxPacketTypes.PING) {
    if (!this.frameCommunication) {
      throw new Error('Frame communication not setup yet');
    }
    return this.frameCommunication.encode({
      message: Buffer.concat([
        getBufferFromHex(new RlpEncoder().encode({ input: code })),
        getBufferFromHex(new RlpEncoder().encode({ input: [] })),
      ]),
    });
  }
}

export type MessageOptions = BaseMessage;

export enum MessageType {
  AUTH_EIP_8,
  HELLO,
  PING,
}
interface BaseMessage {
  type: MessageType;
}

enum MessageState {
  AUTH,
  ACK,
  PACKETS,
}
