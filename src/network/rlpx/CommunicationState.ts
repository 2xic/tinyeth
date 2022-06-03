import { injectable } from 'inversify';
import { RlpEncoder } from '../../rlp/RlpEncoder';
import { KeyPair } from '../../signatures/KeyPair';
import { Signatures } from '../../signatures/Signatures';
import { assertEqual } from '../../utils/enforce';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Logger } from '../../utils/Logger';
import { xor } from '../../utils/XorBuffer';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Auth8Eip } from '../auth/AuthEip8';
import { Packet, RlpxPacketTypes } from '../Packet';
import { Rlpx } from '../Rlpx';
import { ReplayHelloPacket } from '../packet-types/ReplayHelloPacket';
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
    private frameCommunication: FrameCommunication,
    private replayHelloPacket: ReplayHelloPacket
  ) {}

  private nextState: MessageState = MessageState.AUTH;

  /*
    TODO: Move this into a own class
      Frame capsule ? 
  */
  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private _sentPacket?: Buffer;

  private _remotePublicKey?: string;

  public get publicKey() {
    return this.keyPair.getPublicKey();
  }

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    this._remotePublicKey = publicKey;
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
          ethNodePublicKey: this.remotePublicKey,
        });

      this._senderNonce = header.nonce;
      this._secret = header.secret;
      this._sentPacket = authMessage;

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
      const results = await this.parseAuth({ message });
      await callback(results);
    } else if (this.nextState == MessageState.ACK) {
      await this.parseAck({ message });
      await callback(Buffer.from([]));
    } else if (this.nextState === MessageState.PACKETS) {
      await this.parsePacket({
        message,
        callback,
      });
    }
  }

  private async parseAuth({ message }: { message: Buffer }) {
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

    const { results, header } = await this.rlpx.createEncryptedAckMessageEip8({
      ethNodePublicKey: remotePublicKey,
    });
    this.frameCommunication.setup({
      ephemeralSharedSecret: ephemeralSharedSecret,
      initiatorNonce: senderNonce,
      receiverNonce: header.nonce,
      remotePacket: message,
      initiatorPacket: results,
      switchNonce: true,
    });

    return results;
  }

  private async parseAck({ message }: { message: Buffer }) {
    if (!this._secret || !this._senderNonce || !this._sentPacket) {
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

    this.frameCommunication = this.frameCommunication.setup({
      ephemeralSharedSecret: ephemeralSharedSecret,
      initiatorNonce: this._senderNonce,
      receiverNonce: receiverNonce,
      remotePacket: message,
      initiatorPacket: this._sentPacket,
    });
    this.logger.log('Setup frame communication');
    this.nextState = MessageState.PACKETS;
  }

  private async parsePacket({
    message,
    callback,
  }: {
    message: Buffer;
    callback: (message: Buffer) => Promise<void>;
  }) {
    try {
      const body = this.frameCommunication.decode({
        message,
      });
      const packetParser = new Packet();
      const hello = packetParser.parse({
        packet: body,
      });
      if (typeof hello === 'object') {
        this.logger.log('Got a hello :)');
        const encodedMessage = this.replayHelloPacket.replayPacket({
          hello,
        });
        await callback(encodedMessage);
      } else if (hello == RlpxPacketTypes.PING) {
        this.logger.log('Got a ping, replying with pong');
        const encodedMessage = this.encodeMessage(RlpxPacketTypes.PONG);
        await callback(encodedMessage);
      } else if (hello == RlpxPacketTypes.PONG) {
        this.logger.log('Got a pong, should reply with ping');
        const encodedMessage = this.encodeMessage(RlpxPacketTypes.PING);
        await callback(encodedMessage);
      } else {
        this.logger.log('Unknown state ... ');
      }
    } catch (err) {
      console.log(err);
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

  private get remotePublicKey() {
    if (!this._remotePublicKey) {
      throw new Error('No remote public key set');
    }
    return this._remotePublicKey;
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
