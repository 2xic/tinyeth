import { injectable } from 'inversify';
import { CommunicationState } from './CommunicationState';
import fs from 'fs';
import { Logger } from '../../utils/Logger';
import { KeyPair } from '../../signatures';
import { Auth8Eip } from '../auth/AuthEip8';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Rlpx } from '../Rlpx';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { stringify } from 'buffer-json';
import { RlpxMessageEncoder } from './RlpxMessageEncoder';
import { RlpxMessageDecoder } from './packet-types/RlpxMessageDecoder';
import { PeerConnectionState } from './PeerConnectionState';
import { MessageQueue } from './MessageQueue';

@injectable()
export class DebugCommunicationState extends CommunicationState {
  constructor(
    rlpx: Rlpx,
    protected keyPair: KeyPair,
    logger: Logger,
    protected auth8Eip: Auth8Eip,
    protected frameCommunication: FrameCommunication,
    rlpxMessageEncoder: RlpxMessageEncoder,
    rlpxMessageDecoder: RlpxMessageDecoder,
    peerConnection: PeerConnectionState,
    messageQueue: MessageQueue
  ) {
    super(
      rlpx,
      keyPair,
      logger,
      auth8Eip,
      frameCommunication,
      rlpxMessageEncoder,
      rlpxMessageDecoder,
      peerConnection,
      messageQueue
    );
  }

  private communications: Array<Communication | LocalStateChange> = [];

  public setRemotePublicKey({ publicKey }: { publicKey: string }) {
    super.setRemotePublicKey({ publicKey });
    this.communications.push({
      key: '_remotePublicKey',
      value: getBufferFromHex(publicKey),
    });
  }

  protected async createAuthMessageHeader(): Promise<{
    header: { secret: Buffer; nonce: Buffer };
    authMessage: Buffer;
  }> {
    const response = await super.createAuthMessageHeader();

    this.communications.push({
      key: 'createAuthMessageHeader',
      value: response,
    });

    return response;
  }

  public async parseMessage(
    message: Buffer,
    callback: (message: Buffer) => void,
    reject: (err: Error) => void,
    parseOnly = false
  ) {
    this.communications.push({
      direction: 'from',
      message,
    });
    await super.parseMessage(message, callback, reject, parseOnly);
  }

  public async setSenderNonceState({
    header,
    authMessage,
  }: {
    header: {
      nonce: Buffer;
      secret: Buffer;
    };
    authMessage: Buffer;
  }) {
    super.setSenderNonceState({
      header,
      authMessage,
    });
  }

  public async loadAuthMessage({
    input,
    nonce,
  }: {
    input: Buffer;
    nonce: Buffer;
  }) {
    if (!this.remotePublicKey) {
      throw new Error('Need remote public key set');
    }
    const secret = this.keyPair.getEcdh({
      publicKey: this.remotePublicKey,
    });
    super.setSenderNonceState({
      authMessage: input,
      header: {
        nonce: getBufferFromHex(nonce),
        secret,
      },
    });
  }

  public async initializeFrameCommunication({
    localPacket,
    localNonce,
    remotePacket,
    remoteNonce,
    ephemeralSharedSecret,
    switchNonce = false,
  }: {
    localPacket: Buffer;
    localNonce: Buffer;
    remotePacket: Buffer;
    remoteNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce?: boolean;
  }) {
    return this.frameCommunication.setup({
      localNonce,
      localPacket,
      remoteNonce,
      remotePacket,
      switchNonce,
      ephemeralSharedSecret,
    });
  }

  public dump({ path }: { path: string }) {
    if (this.communications.length > 5) {
      fs.writeFileSync(path, stringify(this.communications));
      // eslint-disable-next-line no-console
      console.log(`Saved ${this.communications.length} messages`);
    }
  }
}

export interface Communication {
  direction: 'from' | 'to';
  message: Buffer;
}

export interface LocalStateChange {
  key: string;
  value: unknown;
}
