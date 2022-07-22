import { injectable } from 'inversify';
import net from 'net';
import { Logger } from '../utils/Logger';

@injectable()
export class NodeServer {
  constructor(private logger: Logger) {}

  private _server?: net.Server;

  private PORT_NUMBER = 30303;

  private isRunning?: boolean;

  public start() {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }
    this._server = net.createServer();
    this._server.listen(this.PORT_NUMBER, () => {
      this.logger.log('yeah ?=');
    });

    this._server.on('listening', () => {
      this.logger.log('Listening');
    });

    this._server.on('connection', (socket) => {
      this.logger.log('Connection :)');
      socket.on('data', (data) => {
        this.logger.log(data);
        this.logger.log(data.toString('hex'));
      });
    });

    this.isRunning = true;
  }
}
