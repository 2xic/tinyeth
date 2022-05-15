import net from 'net';

export class Peer {
  private _activeConnection?: net.Socket;

  public async connect(options: { address: string; port: number }) {
    const socket = new net.Socket();
    socket.once('close', () => {
      console.log('Connection closed');
    });
    socket.once('error', () => {
      console.log('Error');
    });
    socket.once('connect', () => {
      console.log('Connected');
    });
    await new Promise<void>((resolve, reject) => {
      socket.connect(options.port, options.address, () => {
        resolve();
      });
    });
    this._activeConnection = socket;
  }

  public async disconnect() {
    const connection = this._activeConnection;

    if (connection) {
      await new Promise<void>((resolve) => {
        connection.destroy();
        connection.once('close', () => {
          resolve();
        });
      });
    }
  }

  public async sendMessage() {}
}
