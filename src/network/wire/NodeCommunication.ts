import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import dgram from 'node:dgram';

import { ParsedEnode } from '../utils/parseEnode';

/**
 * This should be abstracted in a way so that Peer can also reuse this class
 * https://nodejs.org/api/dgram.html
 */
@injectable()
export class NodeCommunication {
  private socket?: dgram.Socket;

  constructor(private logger: Logger) {}

  public async connect({
    onMessage,
    nodeOptions,
  }: {
    nodeOptions: ParsedEnode;
    onMessage: (data: Buffer) => void;
  }) {
    this.socket = dgram.createSocket('udp4');

    this.socket.on('connect', () => {
      console.log('Connection :)');
    });

    this.socket.on('data', (data) => {
      this.logger.log(`Got data of length ${data.length}`);
      onMessage(data);
    });

    this.socket.on('message', (data) => {
      this.logger.log(`Got message of length ${data.length}`);
    });

    this.socket.bind(41234);

    await new Promise<void>((resolve) => {
      this.socket!.connect(nodeOptions.port, nodeOptions.address, () => {
        resolve();
      });
    });
  }

  public async sendMessage(message: Buffer) {
    await new Promise<void>((resolve, reject) => {
      this.socket!.send(message, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
