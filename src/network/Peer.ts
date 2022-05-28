import { ThirtyFpsSharp } from '@mui/icons-material';
import net from 'net';
import { KeyPair } from '../signatures/KeyPair';
import { FrameCommunication } from './auth/FrameCommunication';
import { Auth8Eip } from './AuthEip8';
import { getBufferFromHex } from './getBufferFromHex';
import { getRandomPeer } from './getRandomPeer';
import { Rlpx } from './Rlpx';
import { AbstractSocket } from './socket/AbstractSocket';

export class Peer {
  private _activeConnection?: AbstractSocket;

  private _nodePublicKey?: string;

  private rlpx: Rlpx;

  private frameCommunication?: FrameCommunication;

  private auth8Eip: Auth8Eip;

  private _host?: string;

  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private sentPacket?: Buffer;

  constructor(
    private keyPair = new KeyPair(),
    private ephemeralKeyPair = new KeyPair(),
    private socket: AbstractSocket = new net.Socket() as AbstractSocket
  ) {
    this.rlpx = new Rlpx(
      this.keyPair,
      Buffer.from(this.ephemeralKeyPair.privatekey, 'hex')
    );
    this.auth8Eip = new Auth8Eip(this.rlpx);
  }

  public async connect(options?: {
    publicKey: string;
    address: string;
    port: number;
  }) {
    const nodeOptions = options ? options : getRandomPeer();
    console.log(nodeOptions);
    this.socket.on('close', () => {
      console.log('Connection closed');
      this.socket.destroy();
      // throw new Error('Disconnected');
    });
    this.socket.on('ready', () => {
      console.log('Ready');
    });
    this.socket.on('error', (err) => {
      console.log('Error');
      console.log(err);
    });
    this.socket.on('connect', () => {
      console.log('Connected');
    });
    this.socket.on('drain', () => {
      console.log('drain');
    });
    this.socket.on('lookup', () => {
      console.log('lookup');
    });
    this.socket.on('timeout', () => {
      console.log('timeout');
    });
    this.socket.on('end', () => {
      console.log('end');
    });
    this.socket.on('data', async (data) => {
      console.log('Got data');
      await this.parseMessage(data);
    });
    await new Promise<void>((resolve) => {
      this.socket.connect(nodeOptions.port, nodeOptions.address, () => {
        resolve();
      });
    });
    this._activeConnection = this.socket;
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
      const { results: authMessage, header } =
        await rlpx.createEncryptedAuthMessageEip8({
          ethNodePublicKey: this.nodePublicKey,
        });

      this._senderNonce = header.nonce;
      this._secret = header.secret;
      this.sentPacket = authMessage;

      console.log(
        `Trying to send auth message of length ${authMessage.length} to ${this._host}`
      );

      await this.connectionWrite(authMessage);
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  private async parseMessage(message: Buffer) {
    console.log(`Got the following response buffer ${message.length}`);
    console.log(message.toString('hex'));
    if (220 < message.length) {
      if (!this._secret || !this._senderNonce || !this.sentPacket) {
        throw new Error('Something is wrong');
      }
      const { nonce, publicKey }: { nonce: string; publicKey: string } =
        await this.auth8Eip.decodeAckEip8({
          input: message,
        });
      const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
        publicKey,
      });
      this.frameCommunication = new FrameCommunication(
        ephemeralSharedSecret,
        this._senderNonce,
        getBufferFromHex(nonce)
      ).setup({
        secret: this._secret,

        remoteNonce: getBufferFromHex(nonce),
        remotePacket: message,

        initiatorPacket: this.sentPacket,
        initiatorNonce: this._senderNonce,
      });
      console.log(':)');
    } else {
      console.log('hello ? what is this ser?');
      console.log(
        this.frameCommunication?.parse({
          message,
        })
      );
    }
  }

  private async connectionWrite(message: Buffer) {
    await new Promise<void>((resolve, reject) => {
      this.connection.write(message, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
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
