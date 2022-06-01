import { KeyPair } from '../signatures/KeyPair';
import { FrameCommunication } from './auth/frameing/FrameCommunication';
import { Auth8Eip } from './AuthEip8';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { getRandomPeer } from './getRandomPeer';
import { Packet, RlpxPacketTypes } from './Packet';
import { Rlpx } from './Rlpx';
import { AbstractSocket } from './socket/AbstractSocket';
import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { MessageQueue } from './MessageQueue';
import { GetRlpxPingPacketEncoded } from './packet-types/RlpxPingPacketEncoder';
@injectable()
export class Peer {
  private _activeConnection?: AbstractSocket;

  private frameCommunication?: FrameCommunication;

  private _host?: string;

  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private sentPacket?: Buffer;

  private nextState?: MessageState;

  private isConnected = false;

  constructor(
    private rlpx: Rlpx,
    private keyPair: KeyPair,
    private socket: AbstractSocket,
    private auth8Eip: Auth8Eip,
    private ephemeralKeyPair: KeyPair,
    private logger: Logger,
    public messageQueue: MessageQueue
  ) {}

  public async connect(options?: {
    publicKey: string;
    address: string;
    port: number;
  }) {
    const nodeOptions = options ? options : getRandomPeer();
    this.logger.log(nodeOptions);
    this.socket.on('close', () => {
      this.logger.log('Connection closed');
      this.isConnected = false;
      this.socket.destroy();
    });
    this.socket.on('ready', () => {
      this.logger.log('Ready');
    });
    this.socket.on('error', (err) => {
      this.logger.log('Error');
      this.logger.log(err);
    });
    this.socket.on('connect', () => {
      this.logger.log('Connected');
      this.isConnected = true;
    });
    this.socket.on('drain', () => {
      this.logger.log('drain');
    });
    this.socket.on('lookup', () => {
      this.logger.log('lookup');
    });
    this.socket.on('timeout', () => {
      this.logger.log('timeout');
    });
    this.socket.on('end', () => {
      this.logger.log('end');
    });
    this.messageQueue.setEventHandler(this.parseMessage.bind(this));

    this.socket.on('data', async (data) => {
      this.logger.log(`Got data of length ${data.length}`);
      //  await new Promise((resolve) => setTimeout(resolve, 1000));
      //  await this.parseMessage(data);
      this.messageQueue.push(data);
    });

    await new Promise<void>((resolve) => {
      this.socket.connect(nodeOptions.port, nodeOptions.address, () => {
        resolve();
      });
    });
    this._activeConnection = this.socket;
    this._host = `${nodeOptions.address}:${nodeOptions.port}`;
  }

  public async disconnect() {
    const connection = this._activeConnection;

    if (connection) {
      await new Promise<void>((resolve) => {
        this._activeConnection = undefined;
        connection.destroy();
        connection.on('close', () => {
          resolve();
        });
      });
    }
  }

  public async sendMessage(message: MessageOptions) {
    if (MessageType.AUTH_EIP_8 === message.type) {
      const { results: authMessage, header } =
        await this.rlpx.createEncryptedAuthMessageEip8({
          ethNodePublicKey: this.nodePublicKey,
        });

      this._senderNonce = header.nonce;
      this._secret = header.secret;
      this.sentPacket = authMessage;

      this.logger.log(
        `Trying to send auth message of length ${authMessage.length} to ${this._host}`
      );

      this.nextState = MessageState.ACK;
      await this.connectionWrite(authMessage);
    } else if (MessageType.HELLO === message.type) {
      throw new Error('nono, please go in order ser');
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  private async parseMessage(message: Buffer) {
    this.logger.log(` new data: ${message.toString('hex')}`);
    if (this.nextState == MessageState.ACK) {
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
      this.frameCommunication = new FrameCommunication().setup({
        ephemeralSharedSecret: ephemeralSharedSecret,
        initiatorNonce: this._senderNonce,
        receiverNonce: getBufferFromHex(nonce),
        remotePacket: message,
        initiatorPacket: this.sentPacket,
      });
      this.logger.log('Setup frame communication');
      this.nextState = MessageState.PACKETS;
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
          this.logger.log(hello);
          const helloMessage = new Packet().encodeHello({
            packet: {
              ...hello,
              nodeId: `0x${this.keyPair.getPublicKey()}`,
            },
          });
          const encodedMessage = this.frameCommunication.encode({
            message: helloMessage,
          });
          await this.connectionWrite(encodedMessage);
        } else if (hello == RlpxPacketTypes.PING) {
          this.logger.log('Got a ping, reply with pong');
          const encodedMessage = this.frameCommunication.encode({
            message: Buffer.concat([
              getBufferFromHex(
                new RlpEncoder().encode({ input: RlpxPacketTypes.PONG })
              ),
              getBufferFromHex(new RlpEncoder().encode({ input: [] })),
            ]),
          });
          await this.connectionWrite(encodedMessage);
        } else if (hello == RlpxPacketTypes.PONG) {
          this.logger.log('Got a pong, reply with ping');
          /*
          const encodedMessage = this.frameCommunication.encode({
            message: GetRlpxPingPacketEncoded(),
          });
          await this.connectionWrite(encodedMessage);
          */
        } else {
          this.logger.log('Unknown state ... ');
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  private async connectionWrite(message: Buffer) {
    this.logger.log(`writing on the wire SER, ${message.length}`);
    this.logger.log(` ${message.toString('hex')}`);
    await new Promise<void>((resolve, reject) => {
      this.connection.write(message, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  public get connection() {
    if (!this._activeConnection) {
      throw new Error('No active connection');
    }
    return this._activeConnection;
  }

  public get nodePublicKey() {
    return this.keyPair.getPublicKey();
  }
}

type MessageOptions = BaseMessage;

export enum MessageType {
  AUTH_EIP_8,
  HELLO,
}
interface BaseMessage {
  type: MessageType;
}

enum MessageState {
  AUTH,
  ACK,
  PACKETS,
}
