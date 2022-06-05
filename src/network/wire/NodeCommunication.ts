import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import dgram from 'node:dgram';
import { ConnectionOptions } from './NodeManager';

/**
 * This should be abstracted in a way so that Peer can also reuse this class
 * https://nodejs.org/api/dgram.html
 */
@injectable()
export class NodeCommunication {
  private _socket?: dgram.Socket;

  private connection?: ConnectionOptions;

  constructor(private logger: Logger) {}

  public async connect({
    onMessage,
    nodeOptions,
  }: {
    nodeOptions: ConnectionOptions;
    onMessage: (data: Buffer) => void;
  }) {
    this._socket = dgram.createSocket('udp4');

    this._socket.on('connect', () => {
      console.log('Connection :)');
    });

    this._socket.on('error', (error) => {
      this.logger.log(`Got error ${error}`);
    });

    this._socket.on('message', (data) => {
      this.logger.log(`\tGot message of length ${data.length}`);
      onMessage(data);
    });

    this._socket.on('close', () => {
      this.logger.log('Remote closed :(');
    });

    this._socket.on('listening', () => {
      const address = this.socket.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });
    this.connection = nodeOptions;
  }

  public async sendMessage(message: Buffer) {
    if (1280 < message.length) {
      throw new Error(
        'Packet is larger than the maximum size set by the wire protocol (1280)'
      );
    }
    await new Promise<void>((resolve, reject) => {
      this.socket.send(
        message,
        0,
        message.length,
        this.connection?.port,
        this.connection?.address,
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private get socket() {
    if (!this._socket) {
      throw new Error('Socket not connected');
    }
    return this._socket;
  }
}
