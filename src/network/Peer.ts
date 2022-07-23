import { KeyPair } from '../signatures/KeyPair';
import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import {
  CommunicationState,
  EthMessageType,
  MessageOptions,
  RplxMessageType,
} from './rlpx/CommunicationState';
import { PeerConnection } from './rlpx/PeerConnection';
import { SendStatusMessage } from './rlpx/eth/SendStatusMessage';
import { MyEmitter } from './rlpx/MyEmitter';
import { sleep } from './utils/sleep';
import { isPropertyAccessExpression } from 'typescript';

@injectable()
export class Peer extends MyEmitter<{ disconnect: null }> {
  constructor(
    private keyPair: KeyPair,
    private logger: Logger,
    private communicationState: CommunicationState,
    private peerConnection: PeerConnection,
    private statusMessage: SendStatusMessage
  ) {
    super();
  }

  public messageSent = 0;
  public messageReceived = 0;

  private ping?: NodeJS.Timer;
  private waitingOnMessage = false;
  private sentStatus = false;
  private protocolVersion?: number;
  private sentFirstPing = false;
  private countPing = 0;

  public async connect(options: PeerConnectionOptions) {
    this.logger.log('Trying to connect :)');
    this.peerConnection.on('disconnect', () => {
      this.emit('disconnect', null);
    });

    const socket = await this.peerConnection.connect(options);
    console.log((socket as any).localPort);

    socket.on('error', (err) => {
      this.logger.log('Error');
      this.logger.log(err);
      this.emit('disconnect', null);
    });
    socket.on('drain', () => {
      this.logger.log('drain');
    });
    socket.on('lookup', () => {
      this.logger.log('lookup');
    });
    socket.on('timeout', () => {
      this.logger.log('timeout');
      this.emit('disconnect', null);
    });
    socket.on('end', () => {
      this.logger.log('end');
    });
    socket.on('close', () => {
      this.logger.log('Socket closed');
      if (this.ping) {
        clearInterval(this.ping);
      }
      this.emit('disconnect', null);
      process.exit(0);
    });

    this.communicationState.on('hello', (hello) => {
      this.logger.log('Hello was received - starting ping interval');
      this.protocolVersion = hello.protocolVersion;
      /*
      this.ping = setInterval(async () => {
        if (!this.waitingOnMessage) {
          if (!this.sentFirstPing || this.countPing % 10 == 0) {
            this.waitingOnMessage = true;
            await this.sendMessage({ type: MessageType.PING });
            this.sentFirstPing = true;
            this.countPing++;
          }
        }
      }, 5_00);
      */
    });

    this.communicationState.on('sendStatus', async () => {
      await this.sendMessage({ ethType: EthMessageType.STATUS });

      /*
      const statusMessage = this.statusMessage.sendStatus();
      await this.peerConnection.sendMessage(statusMessage);*/
    });

    this.communicationState.on('pong', async () => {
      if (!this.sentStatus && this.protocolVersion) {
        this.sentStatus = true;
        await sleep(3_000);
        this.logger.log(
          'Trying to send a status message ... (skipping for now) '
        );
        process.exit(0);
        /*
         */
      }
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
}

export interface PeerConnectionOptions {
  publicKey: string;
  address: string;
  port: number;
}
