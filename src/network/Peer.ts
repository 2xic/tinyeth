import { ThirtyFpsSharp } from '@mui/icons-material';
import net from 'net';
import { KeyPair } from '../signatures/KeyPair';
import { getRandomPeer } from './getRandomPeer';
import { Rlpx } from './Rlpx';

export class Peer {
  private _activeConnection?: net.Socket;

  private _nodePublicKey?: string;

  private _host?: string;

  constructor(
    private keyPair = new KeyPair(),
    private ephemeralKeyPair = new KeyPair()
  ) {}

  public async connect(options?: {
    publicKey: string;
    address: string;
    port: number;
  }) {
    const nodeOptions = options ? options : getRandomPeer();
    console.log(nodeOptions);
    const socket = new net.Socket();
    socket.on('close', () => {
      console.log('Connection closed');
      socket.destroy();
      // throw new Error('Disconnected');
    });
    socket.on('ready', () => {
      console.log('Ready');
    });
    socket.on('error', (err) => {
      console.log('Error');
      console.log(err);
    });
    socket.on('connect', () => {
      console.log('Connected');
    });
    socket.on('drain', () => {
      console.log('drain');
    });
    socket.on('lookup', () => {
      console.log('lookup');
    });
    socket.on('timeout', () => {
      console.log('timeout');
    });
    socket.on('end', () => {
      console.log('end');
    });
    socket.on('data', (data) => {
      console.log('Got data');
      console.log(data);
    });
    await new Promise<void>((resolve) => {
      socket.connect(nodeOptions.port, nodeOptions.address, () => {
        resolve();
      });
    });
    this._activeConnection = socket;
    this._nodePublicKey = nodeOptions.publicKey;
    this._host = `${nodeOptions.address}:${nodeOptions.port}`;
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

  public async sendMessage(message: MessageOptions) {
    if ([MessageType.AUTH, MessageType.AUTH_EIP_8].includes(message.type)) {
      const rlpx = new Rlpx(
        this.keyPair,
        Buffer.from(this.ephemeralKeyPair.privatekey, 'hex')
      );
      const authMessage = await rlpx.getEncryptedAuthMessagePreEip8({
        ethNodePublicKey: this.nodePublicKey,
      });

      console.log(
        `Trying to send auth message of length ${authMessage.length} to ${this._host}`
      );

      await new Promise<void>((resolve, reject) => {
        this.connection.write(authMessage, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  public get connection() {
    if (!this._activeConnection) {
      throw new Error('No active connection');
    }
    return this._activeConnection;
  }

  public get nodePublicKey() {
    if (!this._nodePublicKey) {
      throw new Error('No public key set for the node');
    }
    return this._nodePublicKey;
  }
}

type MessageOptions = BaseMessage;

export enum MessageType {
  AUTH_EIP_8,
  AUTH,
}
interface BaseMessage {
  type: MessageType;
}
