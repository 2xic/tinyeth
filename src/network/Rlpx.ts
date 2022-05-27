import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
import { getBufferFromHex } from './getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';
import { encrypt } from 'ecies-geth';
import { RlpxEcies } from './RlpxEcies';
import { assertEqual } from '../utils/enforce';
import { EncodeAuthEip8 } from './auth/EncodeAuthEip8';
import { EncodeAuthPreEip8 } from './auth/EncodeAuthPreEip8';

export class Rlpx {
  constructor(
    public keyPair: KeyPair,
    public ephemeralPrivateKey: Buffer,
    private rlpEncoder = new RlpEncoder()
  ) {}

  public createAuthMessageEip8({
    ethNodePublicKey,
    nonce: inputNonce,
  }: {
    ethNodePublicKey: string;
    nonce?: Buffer;
  }) {
    return new EncodeAuthEip8(this).createAuthMessageEip8({
      ethNodePublicKey,
      nonce: inputNonce,
    });
  }

  public createAuthMessagePreEip8({
    ethNodePublicKey,
    nonce: inputNonce,
  }: {
    ethNodePublicKey: string;
    nonce?: Buffer;
  }): Buffer {
    return new EncodeAuthPreEip8(this).createAuthMessagePreEip8({
      ethNodePublicKey,
      nonce: inputNonce,
    });
  }

  public async encryptedMessage({
    message,
    responderPublicKey: inputResponderPublicKey,
  }: {
    message: Buffer;
    responderPublicKey: Buffer | string;
  }): Promise<Buffer> {
    const responderPublicKey = addMissingPublicKeyByte({
      buffer: getBufferFromHex(inputResponderPublicKey),
    });

    const encryptedMessage = new RlpxEcies(this.keyPair).encryptMessage({
      message,
      remotePublicKey: responderPublicKey,
    });
    return encryptedMessage;
  }

  public async decryptMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }): Promise<Buffer> {
    const isSimpleMessage = encryptedMessage[0] === 4;
    const lengthBuffer = isSimpleMessage
      ? Buffer.from([])
      : encryptedMessage.slice(0, 2);
    const message = isSimpleMessage
      ? encryptedMessage
      : encryptedMessage.slice(2);
    const length = isSimpleMessage
      ? message.length
      : lengthBuffer.readUInt16BE();

    assertEqual(length, message.length);

    const decryptedMessage = new RlpxEcies(this.keyPair).decryptMessage({
      // skip first two bytes because they just say the length
      // might have to reconsider this when the node is connected to the network to prevent ddos etc.
      message,
      mac: lengthBuffer,
    });
    return decryptedMessage;
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

    const remoteEphermalPublicKey = await new KeyPair().verifyMessage({
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
}
