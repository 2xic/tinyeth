import net from 'net';
import { KeyPair } from '../signatures/KeyPair';
import { P2P } from './P2P';

export class NodeServer {
  private _server?: net.Server;

  private p2p: P2P;
  constructor(private nodePrivateKey: string) {
    this.p2p = new P2P(new KeyPair(this.nodePrivateKey));
  }

  private PORT_NUMBER = 3000;

  public start() {
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

    console.log(this.p2p.enode);
    console.log(this.p2p.privateKey);
  }
}
