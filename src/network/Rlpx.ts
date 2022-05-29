import { RlpEncoder } from '../rlp/RlpEncoder';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';
import { RlpxEcies } from './RlpxEcies';
import { EncodeAuthEip8 } from './auth/EncodeAuthEip8';
import crypto from 'crypto';
import { Auth8Eip } from './AuthEip8';
import { injectable } from 'inversify';

@injectable()
export class Rlpx {
  constructor(
    private rlpEncoder: RlpEncoder,
    private encodeAuthEip8: EncodeAuthEip8,
    private auth8Eip: Auth8Eip,
    private rlpxEcies: RlpxEcies
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
    const rlp = this.rlpEncoder.encode({ input: results });
    const padding = crypto.randomBytes(100);
    const encodedRlp = getBufferFromHex(rlp);
    const message = Buffer.concat([encodedRlp, padding]);
    const overhead = 113;
    const totalLength = overhead + message.length;
    const mac = Buffer.from(totalLength.toString(16).padStart(4, '0'), 'hex');

    return {
      results: Buffer.concat([
        mac,
        await this.encryptedMessage({
          message,
          responderPublicKey: ethNodePublicKey,
          mac,
        }),
      ]),
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
