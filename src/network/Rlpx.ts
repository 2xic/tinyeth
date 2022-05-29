import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
import { getBufferFromHex } from './getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';
import { RlpxEcies } from './RlpxEcies';
import { assertEqual } from '../utils/enforce';
import { EncodeAuthEip8 } from './auth/EncodeAuthEip8';
import { EncodeAuthPreEip8 } from './auth/EncodeAuthPreEip8';
import crypto from 'crypto';
import { Auth8Eip } from './AuthEip8';
import { NonceGenerator } from './nonce-generator/NonceGenerator';
import { injectable } from 'inversify';
import { RlpxDecrpyt } from './RlpxDecrypt';
@injectable()
export class Rlpx {
  constructor(
    public keyPair: KeyPair,
    private rlpEncoder: RlpEncoder,
    public randomNumberGenerator: NonceGenerator,
    private encodeAuthEip8: EncodeAuthEip8,
    private encodeAuthPreEip8: EncodeAuthPreEip8,
    private auth8Eip: Auth8Eip,
    private rlpxDecrpyt: RlpxDecrpyt
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

  public createAuthMessagePreEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }): Buffer {
    return this.encodeAuthPreEip8.createAuthMessagePreEip8({
      ethNodePublicKey,
    });
  }

  public async encryptedMessage({
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

    const encryptedMessage = new RlpxEcies(this.keyPair).encryptMessage({
      message,
      remotePublicKey: responderPublicKey,
      mac,
    });
    return encryptedMessage;
  }

  public async getEncryptedAuthMessagePreEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    const authMessage = await this.encryptedMessage({
      message: this.createAuthMessagePreEip8({
        ethNodePublicKey,
      }),
      responderPublicKey: ethNodePublicKey,
    });
    return authMessage;
  }

  public async validateAuthenticationPacket({
    decryptedMessage,
  }: {
    decryptedMessage: Buffer;
  }) {
    const signature = decryptedMessage.slice(0, 64);
    const recoveryId = decryptedMessage[64];
    const hash = decryptedMessage.slice(65, 97);
    const remotePublicKey = decryptedMessage.slice(97, 162);
    const nonce = decryptedMessage.slice(162, 194);

    assertEqual(remotePublicKey.length, 65);
    assertEqual(nonce.length, 65);
    assertEqual(hash.length, 65);

    const echdx = this.keyPair.getEcdh({
      publicKey: remotePublicKey.toString('hex'),
    });

    const remoteEphermalPublicKey = await this.keyPair.verifyMessage({
      signature,
      r: recoveryId,
      message: xor(echdx, nonce),
    });

    const generatedHash = keccak256(
      Buffer.from(remoteEphermalPublicKey, 'hex')
    ).toString('hex');

    if (generatedHash !== hash.toString('hex')) {
      throw new Error('Invalid hash');
    }

    return {
      signature,
      recoveryId,
      hash,
      remotePublicKey,
      nonce,
    };
  }

  public createHello(): Buffer {
    throw new Error('Method not implemented.');
  }
}
