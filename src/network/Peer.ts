import { KeyPair } from '../signatures/KeyPair';
import { getRandomPeer } from './utils/getRandomPeer';
import { AbstractSocket } from './socket/AbstractSocket';
import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { MessageQueue } from './MessageQueue';
import { CommunicationState, MessageOptions } from './rlpx/CommunicationState';

@injectable()
export class Peer {
  private _activeConnection?: AbstractSocket;

  private isConnected = false;

  constructor(
    private keyPair: KeyPair,
    private socket: AbstractSocket,
    private logger: Logger,
    public messageQueue: MessageQueue,
    private communicationState: CommunicationState
  ) {}

  public messageSent = 0;
  public messageReceived = 0;

  public async connect(options?: PeerConnectionOptions) {
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

    this.socket.on('data', async (data) => {
      this.logger.log(`Got data of length ${data.length}`);
      this.messageReceived++;

      await this.communicationState.parseMessage(
        data,
        async (message) => {
          if (Buffer.isBuffer(message)) {
            await this.connectionWrite(message);
          } else {
            this.logger.log('Asked to disconnect...');
            this.socket.destroy();
          }
        },
        (error) => {
          this.logger.log('error happened while parsing message');
          this.logger.log(error);
        }
      );
    });

    await new Promise<void>((resolve) => {
      this.socket.connect(nodeOptions.port, nodeOptions.address, () => {
        resolve();
      });
    });
    this._activeConnection = this.socket;
    if (options?.publicKey) {
      this.communicationState.setRemotePublicKey({
        publicKey: options?.publicKey,
      });
    }
  }

  public async sendMessage(message: MessageOptions) {
    await this.communicationState.sendMessage(
      message,
      this.connectionWrite.bind(this)
    );
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

  private async connectionWrite(message: Buffer) {
    if (message.length) {
      this.messageSent++;

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

export interface PeerConnectionOptions {
  publicKey: string;
  address: string;
  port: number;
}
