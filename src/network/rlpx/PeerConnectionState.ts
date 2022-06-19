import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import {
  FrameCommunication,
  FrameCommunicationSetup,
} from '../auth/frameing/FrameCommunication';
import { DecodeAckMessageInteractor } from './DecodeAckMessageInteractor';
import { DecodeAuthMessageInteractor } from './DecodeAuthMessageInteractor';

@injectable()
export class PeerConnectionState {
  constructor(
    private decodeAuthMessageInteractor: DecodeAuthMessageInteractor,
    private decodeAckMessageInteractor: DecodeAckMessageInteractor,
    protected frameCommunication: FrameCommunication,
    private logger: Logger
  ) {}

  private _state: MessageState = MessageState.AUTH;
  private _senderMetadata: SenderPacket | undefined;
  private _remotePublicKey: string | undefined;

  public enableFrameCommunication(options: FrameCommunicationSetup) {
    this.logger.log('Setup frame communication');
    this.frameCommunication.setup(options);
    this._state = MessageState.PACKETS;
  }

  public setSenderPacket(options: SenderPacket) {
    this._senderMetadata = options;
    this._state = MessageState.ACK;
  }

  public async parseAuth({ message: remoteMessage }: { message: Buffer }) {
    const { ephemeralSharedSecret, remoteNonce, localNonce, localPacket } =
      await this.decodeAuthMessageInteractor.decode({
        authMessage: remoteMessage,
        remotePublicKey: this.remotePublicKey,
      });

    this.enableFrameCommunication({
      ephemeralSharedSecret,
      remoteNonce,
      remotePacket: remoteMessage,
      localNonce,
      localPacket,
    });

    return localPacket;
  }

  public async parseAck({ message: ackMessage }: { message: Buffer }) {
    const { nonce: sentNonce, packet: sendPacket } = this.senderPacket;
    const { receivedNonce, ephemeralSharedSecret } =
      await this.decodeAckMessageInteractor.decode({
        senderNonce: sentNonce,
        authMessage: sendPacket,
        ackMessage,
      });

    this.enableFrameCommunication({
      ephemeralSharedSecret: ephemeralSharedSecret,
      remoteNonce: receivedNonce,
      remotePacket: ackMessage,

      localNonce: sentNonce,
      localPacket: sendPacket,

      switchNonce: true,
    });
  }

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    this._remotePublicKey = publicKey;
  }

  public get senderPacket(): SenderPacket {
    if (!this._senderMetadata) {
      throw Error('Have not set sender packet');
    }
    return this._senderMetadata;
  }

  public get remotePublicKey(): string {
    if (!this._remotePublicKey) {
      throw Error('Have not set sender packet');
    }
    return this._remotePublicKey;
  }

  public get state() {
    return this._state;
  }
}

interface SenderPacket {
  nonce: Buffer;
  secret: Buffer;
  packet: Buffer;
}

export enum MessageState {
  AUTH,
  ACK,
  PACKETS,
}
