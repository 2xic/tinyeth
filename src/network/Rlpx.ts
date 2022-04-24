import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
import { decrypt, encrypt } from 'eciesjs';
import { getBufferFromHex } from './getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';

export class Rlpx {
  constructor(
    public keyPair: KeyPair,
    private ephemeralPrivateKey: Buffer,
    private rlpEncoder = new RlpEncoder()
  ) {}

  // EIP-8 style
  public createAuthMessage({
    ethNodePublicKey,
    nonce: inputNonce,
  }: {
    ethNodePublicKey: string;
    nonce?: Buffer;
  }): Buffer {
    const nonce = inputNonce || crypto.randomBytes(32);
    const ecdhKey = Buffer.from(
      this.keyPair.getEcdh({
        publicKey: ethNodePublicKey,
        privateKey: this.keyPair.privatekey,
      })
    );
    const tokenXorNonce = xor(ecdhKey, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { fullSignature } = new KeyPair().signMessage({
      privateKey: this.ephemeralPrivateKey.toString('hex'), // this.keyPair.privatekey,
      message: tokenXorNonce,
    });
    const bufferSignature = Buffer.from(fullSignature, 'hex');
    if (bufferSignature.length !== 65) {
      throw new Error(
        `Something is wrong with the signature function, expected length 65, but received ${bufferSignature.length}`
      );
    }
    const hashPublicKey = keccak256(
      Buffer.from(
        this.keyPair.getPublicKey({
          privateKey: this.ephemeralPrivateKey.toString('hex'),
        }),
        'hex'
      )
    );
    const rawPublicKey = Buffer.from(this.keyPair.getPublicKey(), 'hex');

    if (rawPublicKey.length !== 64) {
      throw new Error(
        `Wrong raw key length, expected 64, but got ${rawPublicKey.length}`
      );
    }

    return Buffer.concat([
      bufferSignature,
      hashPublicKey,
      rawPublicKey,
      nonce,
      Buffer.from(String.fromCharCode(4)),
    ]);
  }

  // Maybe just using https://github.com/ecies/js is better
  // https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/crypto.py#L115
  public encryptedMessage({
    message,
    responderPublicKey: inputResponderPublicKey,
  }: {
    message: Buffer;
    responderPublicKey: Buffer | string;
  }): Buffer {
    const responderPublicKey = addMissingPublicKeyByte({
      buffer: getBufferFromHex(inputResponderPublicKey),
    });
    return encrypt(responderPublicKey, message);
  }

  public decryptMessage({
    encryptedMessage,
    responderPublicKey: inputResponderPublicKey,
  }: {
    encryptedMessage: Buffer;
    responderPublicKey: Buffer | string;
  }) {
    const responderPublicKey = addMissingPublicKeyByte({
      buffer: getBufferFromHex(inputResponderPublicKey),
    });
    return decrypt(responderPublicKey, encryptedMessage);
  }

  public decryptPacket({ message }: { message: string }): {
    header: unknown;
    body: unknown;
  } {
    throw new Error('Not implemented');
  }
}
