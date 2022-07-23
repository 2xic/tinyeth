import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import { PeerConnectionOptions } from '../Peer';
import { AbstractSocket } from '../socket/AbstractSocket';
import { CommunicationState } from './CommunicationState';
import { MyEmitter } from './MyEmitter';
import { MessageQueue } from './MessageQueue';
import { sleep } from '../utils/sleep';

@injectable()
export class PeerConnection extends MyEmitter<{
  packet: null;
  disconnect: null;
}> {
  private isConnected = true;
  private isReading = false;

  constructor(
    private socket: AbstractSocket,
    private communicationState: CommunicationState,
    private logger: Logger,
    private messageQueue: MessageQueue
  ) {
    super();
  }

  public async connect(options: PeerConnectionOptions) {
    this.communicationState.setRemotePublicKey({
      publicKey: options.publicKey,
    });
    this.socket.on('connect', () => {
      this.logger.log('Connected');
      this.isConnected = true;
    });
    this.socket.on('close', () => {
      this.logger.log('Connection closed');
      this.socket.destroy();
      this.emit('disconnect', null);
    });

    this.socket.on('data', async (data) => {
      this.logger.log(`Got data of length ${data.length}`);
      this.emit('packet', null);
      this.messageQueue.add(data);
    });

    this.communicationState.on('disconnect', (reason: string) => {
      this.logger.log('Asked to disconnect...');
      this.logger.log(reason);
      this.socket.destroy();
      this.isConnected = false;
      this.emit('disconnect', null);
    });

    setInterval(async () => {
      if (!this.isReading && this.messageQueue.isReady) {
        this.isReading = true;

        const data = this.messageQueue.read();
        if (data.length) {
          await this.communicationState.parseMessage(
            data,
            this.sendMessage.bind(this),
            (error) => {
              this.logger.log('error happened while parsing message');
              this.logger.log(error);
              process.exit(0);
            }
          );
        }
        this.isReading = false;
      }
    }, 100);

    this.socket.setTimeout(10_000);

    await new Promise<void>((resolve) => {
      this.socket.connect(options.port, options.address, () => {
        resolve();
      });
    });

    this.logger.log('Connected');

    return this.socket;
  }

  public async sendMessage(message: Buffer) {
    if (message.length) {
      if (this.isConnected) {
        this.logger.log(`Sending a ${message.length} message`);
        await new Promise<void>((resolve, reject) => {
          this.socket.write(message, (error) => {
            if (error) {
              this.logger.log(error);
              reject(error);
            } else {
              resolve();
            }
          });
        });
        this.logger.log('Sent :)');
      } else {
        this.logger.log('Trying to write on disconnected socket...');
      }
    }
  }

  public async disconnect() {
    await new Promise<void>((resolve) => {
      this.socket.destroy();
      this.socket.on('close', () => {
        resolve();
      });
    });
  }
}
