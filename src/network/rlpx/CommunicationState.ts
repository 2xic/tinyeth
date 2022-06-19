import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Logger } from '../../utils/Logger';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Auth8Eip } from '../auth/AuthEip8';
import { Rlpx } from '../Rlpx';
import { RlpxHelloMessageEncoder } from './packet-types/RlpxHelloMessageEncoder';
import { RlpxMessageEncoder } from './RlpxMessageEncoder';
import {
  RlpxMessageDecoder,
  RlpxPacketTypes,
} from './packet-types/RlpxMessageDecoder';
import { MessageState, PeerConnectionState } from './PeerConnectionState';
import { MyEmitter } from './MyEmitter';
import { HEADER_SIZE, MessageQueue } from './MessageQueue';
import { ParsedHelloPacket } from './packet-types/RlpxHelloPacketEncoderDecoder';
import { ReplayHelloPacket } from './packet-types/ReplayHelloPacket';

/**=>
 * TODO: this class is becoming a bit big, and it has a lot of state that could be extracted.
 * Move it out.
 */
@injectable()
export class CommunicationState extends MyEmitter<{
  hello: ParsedHelloPacket;
  pong: null;
  disconnect: string;
}> {
  constructor(
    private rlpx: Rlpx,
    protected keyPair: KeyPair,
    private logger: Logger,
    protected auth8Eip: Auth8Eip,
    protected frameCommunication: FrameCommunication,
    private rlpxMessageEncoder: RlpxMessageEncoder,
    private rlpxMessageDecoder: RlpxMessageDecoder,
    private peerConnection: PeerConnectionState,
    private messageQueue: MessageQueue
  ) {
    super();
  }

  public get publicKey() {
    return this.keyPair.getPublicKey();
  }

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    this.peerConnection.setRemotePublicKey({ publicKey });
  }

  public async constructMessage(
    message: MessageOptions,
    callback: (message: Buffer, header?: unknown) => void
  ) {
    if (MessageType.AUTH_EIP_8 === message.type) {
      this.logger.log('[Sending AUTH8 message]');
      const { authMessage, header } = await this.createAuthMessageHeader();
      callback(authMessage, header);
    } else if (MessageType.HELLO === message.type) {
      throw new Error('This method should not be called from here.');
    } else if (MessageType.PONG === message.type) {
      const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
        RlpxPacketTypes.PONG
      );
      callback(encodedMessage);
    } else if (MessageType.PING === message.type) {
      const ping = this.rlpxMessageEncoder.encodeMessage(RlpxPacketTypes.PING);
      callback(ping);
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  public async parseMessage(
    message: Buffer,
    callback: (message: Buffer) => void,
    error: (err: Error) => void,
    parseOnly = false
  ) {
    await (async () => {
      if (this.peerConnection.state === MessageState.AUTH) {
        this.logger.log('[Received AUTH8 message]');
        const results = await this.peerConnection.parseAuth({ message });
        callback(results);
      } else if (this.peerConnection.state == MessageState.ACK) {
        this.logger.log('[Received ACK message]');

        await this.peerConnection.parseAck({ message });
        this.logger.log('[Sending an hello message]');
        const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
          RlpxPacketTypes.HELLO,
          RlpxHelloMessageEncoder({
            publicKey: this.keyPair.getPublicKey(),
            listenPort: 0,
          })
        );
        this.messageQueue.setLimit({
          size: HEADER_SIZE,
        });

        callback(encodedMessage);
      } else if (this.peerConnection.state === MessageState.PACKETS) {
        await this.parsePacket({
          message,
          callback,
          error,
          parseOnly,
        });
      }
    })().catch((err) => error(err));
  }

  private async parsePacket({
    message,
    callback,
    error,
    parseOnly,
  }: {
    message: Buffer;
    callback: (message: Buffer) => void;
    error: (err: Error) => void;
    parseOnly?: boolean;
  }) {
    try {
      const body = this.frameCommunication.decode({
        message,
      });
      if (body.length === 0) {
        return callback(Buffer.alloc(0));
      }
      this.logger.log(`body : ${body.toString('hex')}`);
      const options = this.rlpxMessageDecoder.decode({
        packet: body,
      });
      if (!parseOnly) {
        if (options.packet === RlpxPacketTypes.HELLO) {
          this.logger.log('[Got a hello :)]');
          this.logger.log(JSON.stringify(options));
          this.emit('hello', options.data);
          callback(Buffer.alloc(0));
        } else if (options.packet == RlpxPacketTypes.PING) {
          this.logger.log('[Got a ping, replying with pong]');
          const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
            RlpxPacketTypes.PONG
          );
          callback(encodedMessage);
        } else if (options.packet == RlpxPacketTypes.PONG) {
          this.logger.log('[Got a pong]');
          this.emit('pong', null);
          callback(Buffer.alloc(0));
        } else if (options.packet == RlpxPacketTypes.DISCONNECT) {
          this.emit('disconnect', options.data.reason);
          callback(Buffer.alloc(0));
        } else {
          this.logger.log('Unknown state ... ');
        }
      } else {
        callback(Buffer.alloc(0));
      }
    } catch (err) {
      if (err instanceof Error) {
        error(err);
      } else {
        error(new Error('Something went wrong'));
      }
    }
  }

  // TODO: Remove this
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

  // TODO: Remove this
  protected setSenderNonceState({
    header: { secret, nonce },
    authMessage: packet,
  }: {
    header: {
      nonce: Buffer;
      secret: Buffer;
    };
    authMessage: Buffer;
  }) {
    this.peerConnection.setSenderPacket({ packet, secret, nonce });
  }

  protected get remotePublicKey() {
    return this.peerConnection.remotePublicKey;
  }

  public get nextState() {
    return this.peerConnection.state;
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
