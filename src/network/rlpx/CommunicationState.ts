import { injectable } from 'inversify';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
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
import { RlpxHelloMessageEncoder } from '../packet-types/RlpxHelloMessageEncoder';
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
    private frameCommunication: FrameCommunication
  ) {}

  public nextState: MessageState = MessageState.AUTH;

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
    callback: (message: Buffer, header?: unknown) => Promise<void>
  ) {
    if (MessageType.AUTH_EIP_8 === message.type) {
      this.logger.log('[Sending AUTH8 message]');
      const { authMessage, header } = await this.createAuthMessageHeader();
      await callback(authMessage, header);
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
    callback: (message: Buffer) => Promise<void>,
    parseOnly = false
  ) {
    //this.logger.log(` new data: ${message.toString('hex')}`);
    if (this.nextState === MessageState.AUTH) {
      this.logger.log('[Received AUTH8 message]');
      const results = await this.parseAuth({ message });
      await callback(results);
    } else if (this.nextState == MessageState.ACK) {
      this.logger.log('[Received ACK message]');
      await this.parseAck({ message });

      this.logger.log('[Sending an hello message]');
      const encodedMessage = this.encodeMessage(
        RlpxPacketTypes.HELLO,
        RlpxHelloMessageEncoder(this.keyPair.getPublicKey())
      );
      await callback(encodedMessage);
    } else if (this.nextState === MessageState.PACKETS) {
      await this.parsePacket({
        message,
        callback,
        parseOnly,
      });
    }
  }

  private async parseAuth({ message: remoteMessage }: { message: Buffer }) {
    const decodedAuthMessage = await this.auth8Eip.decodeAuthEip8({
      input: remoteMessage,
    });
    const sharedSecret = this.keyPair.getEcdh({
      publicKey: this.remotePublicKey,
    });

    const remoteNonce = getBufferFromHex(decodedAuthMessage.nonce);
    const remotePublicKey = this.signatures.getPublicKeyFromSignature({
      message: xor(sharedSecret, remoteNonce),
      signature: getBufferFromHex(decodedAuthMessage.signature).slice(0, 64),
      r: getBufferFromHex(decodedAuthMessage.signature)[64],
    });

    const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
      publicKey: remotePublicKey,
    });

    const { results: localPacket, header } =
      await this.rlpx.createEncryptedAckMessageEip8({
        ethNodePublicKey: remotePublicKey,
      });
    const localNonce = header.nonce;

    this.frameCommunication.setup({
      ephemeralSharedSecret: ephemeralSharedSecret,

      remoteNonce: remoteNonce,
      remotePacket: remoteMessage,

      localNonce,
      localPacket,
    });
    this.nextState = MessageState.PACKETS;

    return localPacket;
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

    const receivedNonce = getBufferFromHex(nonce);

    assertEqual(getBufferFromHex(nonce).length, 32, 'Nonce length is wrong');
    assertEqual(
      getBufferFromHex(publicKey).length,
      64,
      'Public key length is wrong'
    );
    assertEqual(receivedNonce.length, 32, 'Received nonce length is wrong');
    assertEqual(this._senderNonce.length, 32, 'Nonce length is wrong');

    assertEqual(!!message.length, true, 'Element is not defined');
    assertEqual(!!this._sentPacket, true, 'Element is not defined');

    this.frameCommunication = this.frameCommunication.setup({
      ephemeralSharedSecret: ephemeralSharedSecret,
      remoteNonce: receivedNonce,
      remotePacket: message,

      localNonce: this._senderNonce,
      localPacket: this._sentPacket,

      switchNonce: true,
    });

    this.logger.log('Setup frame communication');
    this.nextState = MessageState.PACKETS;
  }

  private async parsePacket({
    message,
    callback,
    parseOnly,
  }: {
    message: Buffer;
    parseOnly?: boolean;
    callback: (message: Buffer) => Promise<void>;
  }) {
    try {
      this.logger.log('[Received a packet?]');

      const body = this.frameCommunication.decode({
        message,
      });
      const packetParser = new Packet();
      const hello = packetParser.parse({
        packet: body,
      });
      if (!parseOnly) {
        if (typeof hello === 'object') {
          this.logger.log('Got a hello :)');
          await callback(Buffer.alloc(0));
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
      } else {
        await callback(Buffer.alloc(0));
      }
    } catch (err) {
      console.log(err);
    }
  }

  private encodeMessage(
    code: RlpxPacketTypes.PONG | RlpxPacketTypes.PING | RlpxPacketTypes.HELLO,
    payload: InputTypes = []
  ) {
    if (!this.frameCommunication) {
      throw new Error('Frame communication not setup yet');
    }
    return this.frameCommunication.encode({
      message: Buffer.concat([
        getBufferFromHex(new RlpEncoder().encode({ input: code })),
        getBufferFromHex(new RlpEncoder().encode({ input: payload })),
      ]),
    });
  }

  protected async createAuthMessageHeader() {
    const { results: authMessage, header } =
      await this.rlpx.createEncryptedAuthMessageEip8({
        ethNodePublicKey: this.remotePublicKey,
      });

    this.setSenderNonceState({
      header,
      authMessage,
    });

    return {
      header,
      authMessage,
    };
  }

  protected setSenderNonceState({
    header,
    authMessage,
  }: {
    header: {
      nonce: Buffer;
      secret: Buffer;
    };
    authMessage: Buffer;
  }) {
    this._senderNonce = header.nonce;
    this._secret = header.secret;
    this._sentPacket = authMessage;

    this.nextState = MessageState.ACK;
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

export enum MessageState {
  AUTH,
  ACK,
  PACKETS,
}
