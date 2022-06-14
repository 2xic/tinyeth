import { injectable } from 'inversify';
import { CommunicationState } from './CommunicationState';
import fs from 'fs';
import { Logger } from '../../utils/Logger';
import { KeyPair } from '../../signatures';
import { Signatures } from '../../signatures/Signatures';
import { Auth8Eip } from '../auth/AuthEip8';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Rlpx } from '../Rlpx';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { stringify } from 'buffer-json';
import { DecodeAuthMessageInteractor } from './DecodeAuthMessageInteractor';
import { DecodeAckMessageInteractor } from './DecodeAckMessageInteractor';
import { RlpxMessageEncoder } from './RlpxMessageEncoder';
import { RlpxMessageDecoder } from './packet-types/RlpxMessageDecoder';

@injectable()
export class DebugCommunicationState extends CommunicationState {
  constructor(
    rlpx: Rlpx,
    keyPair: KeyPair,
    signatures: Signatures,
    logger: Logger,
    ephemeralKeyPair: KeyPair,
    auth8Eip: Auth8Eip,
    frameCommunication: FrameCommunication,
    decodeAuthMessageInteractor: DecodeAuthMessageInteractor,
    decodeAckMessageInteractor: DecodeAckMessageInteractor,
    rlpxMessageEncoder: RlpxMessageEncoder,
    rlpxMessageDecoder: RlpxMessageDecoder
  ) {
    super(
      rlpx,
      keyPair,
      signatures,
      logger,
      ephemeralKeyPair,
      auth8Eip,
      frameCommunication,
      decodeAuthMessageInteractor,
      decodeAckMessageInteractor,
      rlpxMessageEncoder,
      rlpxMessageDecoder
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

  public dump({ path }: { path: string }) {
    fs.writeFileSync(path, stringify(this.communications));
    console.log(`Saved ${this.communications.length} messages`);
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
