import { RlpEncoder } from '../rlp/RlpEncoder';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';
import { RlpxEcies } from './RlpxEcies';
import { EncodeAuthEip8 } from './auth/EncodeAuthEip8';
import crypto from 'crypto';
import { Auth8Eip } from './AuthEip8';
import { injectable } from 'inversify';
import { GetRandomBytesInteractor } from './nonce-generator/GetRandomBytesInteractor';
import { EncodeAckEip8 } from './auth/EncodeAckEip8';

@injectable()
export class Rlpx {
  constructor(
    private rlpEncoder: RlpEncoder,
    private encodeAuthEip8: EncodeAuthEip8,
    private auth8Eip: Auth8Eip,
    private rlpxEcies: RlpxEcies,
    private getRandomBytes: GetRandomBytesInteractor,
    private ack8Eip: EncodeAckEip8
  ) {}

  public decryptEip8AuthMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }) {
    return this.auth8Eip.decodeAuthEip8({
      input: encryptedMessage,
    });
  }

  public async createEncryptedAuthMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    const { results, header } = this.encodeAuthEip8.createAuthMessageEip8({
      ethNodePublicKey,
    });
    // TODO: Logic here can be shared with ack
    const rlp = this.rlpEncoder.encode({ input: results });
    const padding = this.getRandomBytes.getRandomBytes({ length: 100 });
    const encodedRlp = getBufferFromHex(rlp);
    const message = Buffer.concat([encodedRlp, padding]);
    const overhead = 113;
    const totalLength = overhead + message.length;
    const mac = Buffer.from(totalLength.toString(16).padStart(4, '0'), 'hex');

    const encryptedMessage = await this.encryptedMessage({
      message,
      responderPublicKey: ethNodePublicKey,
      mac,
    });

    return {
      results: Buffer.concat([mac, encryptedMessage]),
      header,
    };
  }

  public async createEncryptedAckMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    // TODO: Logic here can be shared with auth
    const { results, header } = this.ack8Eip.createACkMessageEip8();
    const rlp = this.rlpEncoder.encode({ input: results });
    const padding = this.getRandomBytes.getRandomBytes({ length: 100 });
    const encodedRlp = getBufferFromHex(rlp);
    const message = Buffer.concat([encodedRlp, padding]);

    const overhead = 113;
    const totalLength = overhead + message.length;
    const mac = Buffer.from(totalLength.toString(16).padStart(4, '0'), 'hex');

    const encryptedMessage = await this.encryptedMessage({
      message,
      responderPublicKey: ethNodePublicKey,
      mac,
    });

    return {
      results: Buffer.concat([mac, encryptedMessage]),
      header,
    };
  }

  public createAuthMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }): Buffer {
    return Buffer.concat(
      this.encodeAuthEip8.createAuthMessageEip8({
        ethNodePublicKey,
      }).results
    );
  }

  private async encryptedMessage({
    message,
    responderPublicKey: inputResponderPublicKey,
    mac,
  }: {
    message: Buffer;
    responderPublicKey: Buffer | string;
    mac?: Buffer;
  }): Promise<Buffer> {
    const responderPublicKey = addMissingPublicKeyByte({
      buffer: getBufferFromHex(inputResponderPublicKey),
    });

    const encryptedMessage = this.rlpxEcies.encryptMessage({
      message,
      remotePublicKey: responderPublicKey,
      mac,
    });
    return encryptedMessage;
  }
}
