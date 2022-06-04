import { injectable } from 'inversify';
import net from 'net';

@injectable()
export class NodeServer {
  private _server?: net.Server;

  private PORT_NUMBER = 3000;

  private isRunning?: boolean;

  public start() {
    if (!this.isRunning) {
      throw new Error('Server is already running');
    }
    this._server = net.createServer();
    this._server.listen(this.PORT_NUMBER, () => {
      console.log('yeah ?=');
    });

    this._server.on('listening', () => {
      console.log('Listening');
    });

    this._server.on('connection', (socket) => {
      console.log('Connection :)');
      socket.on('data', (data) => {
        console.log(data);
        console.log(data.toString('hex'));
      });
    });

    this.isRunning = true;
  }
}
