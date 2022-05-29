import { KeyPair } from '../signatures/KeyPair';
import { FrameCommunication } from './auth/FrameCommunication';
import { Auth8Eip } from './AuthEip8';
import { getBufferFromHex } from './getBufferFromHex';
import { getRandomPeer } from './getRandomPeer';
import { Packet } from './Packet';
import { Rlpx } from './Rlpx';
import { AbstractSocket } from './socket/AbstractSocket';
import { injectable } from 'inversify';
@injectable()
export class Peer {
  private _activeConnection?: AbstractSocket;

  private _nodePublicKey?: string;

  private frameCommunication?: FrameCommunication;

  private _host?: string;

  private _senderNonce?: Buffer;

  private _secret?: Buffer;

  private sentPacket?: Buffer;

  constructor(
    private rlpx: Rlpx,
    private keyPair: KeyPair,
    private socket: AbstractSocket,
    private auth8Eip: Auth8Eip,
    private ephemeralKeyPair: KeyPair
  ) {}

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
    if (MessageType.AUTH_EIP_8 === message.type) {
      const { results: authMessage, header } =
        await this.rlpx.createEncryptedAuthMessageEip8({
          ethNodePublicKey: this.nodePublicKey,
        });

      this._senderNonce = header.nonce;
      this._secret = header.secret;
      this.sentPacket = authMessage;

      console.log(
        `Trying to send auth message of length ${authMessage.length} to ${this._host}`
      );

      await this.connectionWrite(authMessage);
    } else if (MessageType.HELLO === message.type) {
      throw new Error('nono, please go in order ser');
    } else {
      throw new Error(`Unknown message type${message.type}`);
    }
  }

  private async parseMessage(message: Buffer) {
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
        remotePacket: message,
        initiatorPacket: this.sentPacket,
      });
    } else {
      if (!this.frameCommunication) {
        throw new Error('Missing frame communicator');
      }
      const body = this.frameCommunication.parse({
        message,
      });
      const packetParser = new Packet();
      const hello = packetParser.parse({
        packet: body,
      });
      /** Todo run some validation here maybe ? */
      console.log('Trying to say hello');
      /*await this.sendMessage({
        type: MessageType.HELLO,
      });
      */
      const heloMessage = new Packet().encodeHello({
        packet: {
          ...hello,
          nodeId: `0x${this.keyPair.getPublicKey()}`,
        },
      });
      const encodedMessage = this.frameCommunication.encode({
        message: heloMessage,
      });
      await this.connectionWrite(encodedMessage);
    }
  }

  private async connectionWrite(message: Buffer) {
    console.log(`writing on the wire SER, ${message.length}`);
    console.log(` ${message.toString('hex')}`);
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
  HELLO,
}
interface BaseMessage {
  type: MessageType;
}
