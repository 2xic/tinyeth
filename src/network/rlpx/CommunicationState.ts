import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Logger } from '../../utils/Logger';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Auth8Eip } from '../auth/AuthEip8';
import { Rlpx } from '../Rlpx';
import { SimpleRplxHelloMessageEncoder } from './packet-types/RlpxHelloMessageEncoder';
import { RlpxMessageEncoder } from './RlpxMessageEncoder';
import {
  RlpxMessageDecoder,
  RlpxPacketTypes,
} from './packet-types/RlpxMessageDecoder';
import { MessageState, PeerConnectionState } from './PeerConnectionState';
import { MyEmitter } from './MyEmitter';
import { HEADER_SIZE, MessageQueue } from './MessageQueue';
import { ParsedHelloPacket } from './packet-types/RlpxHelloPacketEncoderDecoder';
import { NodeId } from './NodeId';
import { sleep } from '../utils/sleep';
import { SendEthMessage } from './eth/SendEthMessage';

/**=>
 * TODO: this class is becoming a bit big, and it has a lot of state that could be extracted.
 * Move it out.
 */
@injectable()
export class CommunicationState extends MyEmitter<{
  hello: ParsedHelloPacket;
  sendStatus: null;
  sendBlockHeaders: {
    requestId: Buffer;
  };
  requestBlockHeaders: null;
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
    private messageQueue: MessageQueue,
    private nodeId: NodeId,
    private simpleRplxHelloMessageEncoder: SimpleRplxHelloMessageEncoder,
    private sendEthMessage: SendEthMessage
  ) {
    super();
  }

  private isProtocolActive = false;

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
    if ('rplxType' in message) {
      if (RplxMessageType.AUTH_EIP_8 === message.rplxType) {
        this.logger.log('[Sending AUTH8 message]');
        const { authMessage, header } = await this.createAuthMessageHeader();
        callback(authMessage, header);
      } else if (RplxMessageType.HELLO === message.rplxType) {
        throw new Error('This method should not be called from here.');
      } else if (RplxMessageType.PONG === message.rplxType) {
        const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
          RlpxPacketTypes.PONG
        );
        callback(encodedMessage);
      } else if (RplxMessageType.PING === message.rplxType) {
        const ping = this.rlpxMessageEncoder.encodeMessage(
          RlpxPacketTypes.PING
        );
        callback(ping);
      } else {
        throw new Error(`Unknown message type${message.rplxType}`);
      }
    } else {
      if (EthMessageType.STATUS === message.ethType) {
        const statusMessage = this.sendEthMessage.sendStatus();
        callback(statusMessage);
      } else if (
        message.requestId &&
        EthMessageType.SEND_BLOCK_HEADERS === message.ethType
      ) {
        const blockHeaders = this.sendEthMessage.sendBlockHeaders({
          requestId: message.requestId,
        });
        callback(blockHeaders);
        await sleep(1500);
        this.emit('requestBlockHeaders', null);
      } else if (EthMessageType.GET_BLOCK_HEADERS === message.ethType) {
        const requestBlockHeaders = this.sendEthMessage.requestBlockHeaders();
        callback(requestBlockHeaders);
      } else {
        throw new Error(`Unknown message type${message.ethType}`);
      }
    }
  }

  public async parseMessage(
    message: Buffer,
    callback: (message: Buffer) => void,
    error: (err: Error) => void,
    parseOnly = false
  ) {
    await (async () => {
      // this.logger.log(`Got message ${message}`);
      if (this.peerConnection.state === MessageState.AUTH) {
        this.logger.log('[Received AUTH8 message]');
        const results = await this.peerConnection.parseAuth({ message });
        callback(results);
      } else if (this.peerConnection.state == MessageState.ACK) {
        this.logger.log('[Received ACK message]');

        await this.peerConnection.parseAck({ message });
        this.logger.log('[Sending an hello message]');
        //   await new Promise((resolve) => setTimeout(resolve, 3000));
        const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
          RlpxPacketTypes.HELLO,
          this.simpleRplxHelloMessageEncoder.simpleRlpxHelloMessageEncoder()
        );
        this.messageQueue.setLimit({
          size: HEADER_SIZE,
        });

        //        this.isProtocolActive = true;

        callback(encodedMessage);
      } else if (this.peerConnection.state === MessageState.PACKETS) {
        this.logger.log('Packet ? ');
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
      let pingPong = false;
      if (this.isProtocolActive) {
        if (body) {
          const packet = body;
          const packetId = packet[0];
          const packetPayload = packet.slice(1);
          // falsy values are parsed as 0x80 in RLP
          const parsedPacketId = packetId === 0x80 ? 0 : packetId;
          const isPing = parsedPacketId;

          if (parsedPacketId === EthMessageType.STATUS) {
            this.logger.log('Got status message :)');
            /*
            this.logger.log(
              JSON.stringify(
                new RlpDecoder().decode({
                  input: packetPayload.toString('hex'),
                })
              )
            );
            console.log(SnappyDecompress(packetPayload));
            console.log(
              new RlpDecoder().decode({
                input: SnappyDecompress(packetPayload).toString('hex'),
              })
            );
            */

            await sleep(500);
            this.emit('sendStatus', null);
            callback(Buffer.alloc(0));
          } else if (parsedPacketId === EthMessageType.GET_BLOCK_HEADERS) {
            const { requestId } =
              this.sendEthMessage.parseBlockRequest(packetPayload);
            this.emit('sendBlockHeaders', { requestId });
          } else if (parsedPacketId === EthMessageType.SEND_BLOCK_HEADERS) {
            this.sendEthMessage.parseBlockResponse(packetPayload);
          } else if (
            isPing === RplxMessageType.PING ||
            parsedPacketId === RplxMessageType.PONG
          ) {
            pingPong = true;
          } else {
            throw new Error(
              `what kind of message is this ? (${parsedPacketId})`
            );
          }
        }
      }

      if (!this.isProtocolActive || pingPong) {
        const options = this.rlpxMessageDecoder.decode({
          packet: body,
        });
        this.logger.log(`parsed : ${JSON.stringify(options)}`);
        if (!parseOnly) {
          if (options.packet === RlpxPacketTypes.HELLO) {
            this.logger.log('[Got a hello :)]');
            this.logger.log(JSON.stringify(options));
            this.emit('hello', options.data);
            callback(Buffer.alloc(0));
            this.isProtocolActive = true;
          } else if (options.packet == RlpxPacketTypes.PING) {
            this.logger.log('[Got a ping, replying with pong]');
            const encodedMessage = this.rlpxMessageEncoder.encodeMessage(
              RlpxPacketTypes.PONG
            );
            callback(encodedMessage);
            // TODO: remove this, it should not be executed,
            /*          await sleep(100);
            this.emit('pong', null);*/
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

export type MessageOptions = RplxMessage | EthMessage;

export enum RplxMessageType {
  AUTH_EIP_8,
  HELLO,
  PING,
  PONG,
}

export enum EthMessageType {
  STATUS = 16,
  GET_BLOCK_HEADERS = 19,
  SEND_BLOCK_HEADERS = 20,
}

interface RplxMessage {
  rplxType: RplxMessageType;
}

interface EthMessage {
  ethType: EthMessageType;
  requestId?: Buffer;
}
