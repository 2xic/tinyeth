import { KeyPair } from '../signatures/KeyPair';
import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import {
  CommunicationState,
  MessageOptions,
  MessageType,
} from './rlpx/CommunicationState';
import { PeerConnection } from './rlpx/PeerConnection';

@injectable()
export class Peer {
  constructor(
    private keyPair: KeyPair,
    private logger: Logger,
    private communicationState: CommunicationState,
    private peerConnection: PeerConnection
  ) {}

  public messageSent = 0;
  public messageReceived = 0;

  private ping?: NodeJS.Timer;
  private waitingOnMessage = false;

  public async connect(options: PeerConnectionOptions) {
    const socket = await this.peerConnection.connect(options);

    socket.on('error', (err) => {
      this.logger.log('Error');
      this.logger.log(err);
    });
    socket.on('drain', () => {
      this.logger.log('drain');
    });
    socket.on('lookup', () => {
      this.logger.log('lookup');
    });
    socket.on('timeout', () => {
      this.logger.log('timeout');
    });
    socket.on('end', () => {
      this.logger.log('end');
    });
    socket.on('close', () => {
      this.logger.log('Socket closed');
    });

    this.communicationState.on('hello', () => {
      this.logger.log('Hello was sent - starting ping interval');
      this.ping = setInterval(async () => {
        if (!this.waitingOnMessage) {
          this.waitingOnMessage = true;
          await this.sendMessage({ type: MessageType.PING });
        }
      }, 1500);
    });

    this.peerConnection.on('packet', () => {
      this.waitingOnMessage = false;
    });
  }

  public async sendMessage(message: MessageOptions) {
    const messageBuffer = await new Promise<Buffer>((resolve) =>
      this.communicationState.constructMessage(message, resolve)
    );
    await this.peerConnection.sendMessage(messageBuffer);
  }

  public async disconnect() {
    await this.peerConnection.disconnect();
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
