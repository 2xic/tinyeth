import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Signatures } from '../../signatures/Signatures';
import { Logger } from '../../utils/Logger';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Auth8Eip } from '../auth/AuthEip8';
import { Rlpx } from '../Rlpx';
import { RlpxHelloMessageEncoder } from './packet-types/RlpxHelloMessageEncoder';
import { DecodeAuthMessageInteractor } from './DecodeAuthMessageInteractor';
import { DecodeAckMessageInteractor } from './DecodeAckMessageInteractor';
import { RlpxMessageEncoder } from './RlpxMessageEncoder';
import {
  RlpxMessageDecoder,
  RlpxPacketTypes,
} from './packet-types/RlpxMessageDecoder';
/**
 * TODO: this class is becoming a bit big, and it has a lot of state that could be extracted.
 * Move it out.
 */
@injectable()
export class CommunicationState {
  constructor(
    private rlpx: Rlpx,
    protected keyPair: KeyPair,
    private signatures: Signatures,
    private logger: Logger,
    private ephemeralKeyPair: KeyPair,
    protected auth8Eip: Auth8Eip,
    protected frameCommunication: FrameCommunication,
    private decodeAuthMessageInteractor: DecodeAuthMessageInteractor,
    private decodeAckMessageInteractor: DecodeAckMessageInteractor,
    private rlpxMessageEncoder: RlpxMessageEncoder,
    private rlpxMessageDecoder: RlpxMessageDecoder
  ) {}

  public nextState: MessageState = MessageState.AUTH;

  /*
    TODO: Move this into a own class
      Frame capsule ? 
  */
  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private _sentPacket?: Buffer;

  protected _remotePublicKey?: string;

  public get publicKey() {
    return this.keyPair.getPublicKey();
  }

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    this._remotePublicKey = publicKey;
  }

  public async sendMessage(
    message: MessageOptions,
    callback: (message: Buffer, header?: unknown) => void
  ) {
    if (MessageType.AUTH_EIP_8 === message.type) {
      this.logger.log('[Sending AUTH8 message]');
      const { authMessage, header } = await this.createAuthMessageHeader();
      callback(authMessage, header);
    } else if (MessageType.HELLO === message.type) {
      throw new Error('Nono, please go in order ser');
    } else if (MessageType.PONG === MessageType.PONG) {
      const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
        RlpxPacketTypes.PONG
      );
      callback(encodedMessage);
    } else if (MessageType.PING === message.type) {
      callback(this.rlpxMessageEncoder.encodeMessage(RlpxPacketTypes.PONG));
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  public async parseMessage(
    message: Buffer,
    callback: (message: Buffer | RlpxPacketTypes.DISCONNECT) => void,
    error: (err: Error) => void,
    parseOnly = false
  ) {
    await (async () => {
      //this.logger.log(` new data: ${message.toString('hex')}`);
      if (this.nextState === MessageState.AUTH) {
        this.logger.log('[Received AUTH8 message]');
        const results = await this.parseAuth({ message });
        callback(results);
      } else if (this.nextState == MessageState.ACK) {
        this.logger.log('[Received ACK message]');
        await this.parseAck({ message });

        this.logger.log('[Sending an hello message]');
        const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
          RlpxPacketTypes.HELLO,
          RlpxHelloMessageEncoder({
            publicKey: this.keyPair.getPublicKey(),
            listenPort: 0,
          })
        );
        callback(encodedMessage);
      } else if (this.nextState === MessageState.PACKETS) {
        await this.parsePacket({
          message,
          callback,
          error,
          parseOnly,
        });
      }
    })().catch((err) => error(err));
  }

  private async parseAuth({ message: remoteMessage }: { message: Buffer }) {
    const { ephemeralSharedSecret, remoteNonce, localNonce, localPacket } =
      await this.decodeAuthMessageInteractor.decode({
        authMessage: remoteMessage,
        remotePublicKey: this.remotePublicKey,
      });

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

  private async parseAck({ message: ackMessage }: { message: Buffer }) {
    if (!this._secret || !this._senderNonce || !this._sentPacket) {
      throw new Error('Something is wrong');
    }

    const { receivedNonce, ephemeralSharedSecret } =
      await this.decodeAckMessageInteractor.decode({
        senderNonce: this._senderNonce,
        authMessage: this._sentPacket,
        ackMessage,
      });

    this.frameCommunication.setup({
      ephemeralSharedSecret: ephemeralSharedSecret,
      remoteNonce: receivedNonce,
      remotePacket: ackMessage,

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
    error,
    parseOnly,
  }: {
    message: Buffer;
    callback: (message: Buffer | RlpxPacketTypes.DISCONNECT) => void;
    error: (err: Error) => void;
    parseOnly?: boolean;
  }) {
    try {
      this.logger.log(`[Received a packet of length ${message.length}]`);
      const body = this.frameCommunication.decode({
        message,
      });
      if (body.length === 0) {
        return callback(Buffer.alloc(0));
      }
      const packet = this.rlpxMessageDecoder.decode({
        packet: body,
      });
      if (!parseOnly) {
        if (typeof packet === 'object') {
          this.logger.log('Got a hello :)');
          callback(Buffer.alloc(0));
        } else if (packet == RlpxPacketTypes.PING) {
          this.logger.log('Got a ping, replying with pong');
          const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
            RlpxPacketTypes.PONG
          );
          callback(encodedMessage);
        } else if (packet == RlpxPacketTypes.PONG) {
          this.logger.log('Got a pong, should reply with ping');
          const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
            RlpxPacketTypes.PING
          );
          callback(encodedMessage);
        } else if (packet == RlpxPacketTypes.DISCONNECT) {
          callback(RlpxPacketTypes.DISCONNECT);
        } else {
          this.logger.log('Unknown state ... ');
        }
      } else {
        callback(Buffer.alloc(0));
      }
    } catch (err) {
      if (err instanceof Error) {
        error(err);
      }
    }
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
  PONG,
}
interface BaseMessage {
  type: MessageType;
}

export enum MessageState {
  AUTH,
  ACK,
  PACKETS,
}
