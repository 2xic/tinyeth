import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
import { getBufferFromHex } from './getBufferFromHex';
import { addMissingPublicKeyByte } from '../signatures/addMissingPublicKyeByte';
import { encrypt, decrypt, sign } from 'ecies-geth';
import secp256k1 from 'secp256k1';

export class Rlpx {
  constructor(
    public keyPair: KeyPair,
    private ephemeralPrivateKey: Buffer,
    private rlpEncoder = new RlpEncoder()
  ) {}

  public createAuthMessageEip8({
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
      Buffer.from([0x4]),
    ]);
  }

  public createAuthMessagePreEip8({
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
      })
    );
    const tokenXorNonce = xor(ecdhKey, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { signature, recovery } = new KeyPair().signMessage({
      privateKey: this.ephemeralPrivateKey.toString('hex'),
      message: tokenXorNonce,
    });

    const bufferSignature = Buffer.concat([signature, Buffer.from([recovery])]);
    const hashPublicKey = keccak256(
      Buffer.from(
        this.keyPair.getPublicKey({
          privateKey: this.ephemeralPrivateKey.toString('hex'),
        }),
        'hex'
      )
    );
    const rawPublicKey = Buffer.concat([
      Buffer.from([4]),
      Buffer.from(this.keyPair.getPublicKey(), 'hex'),
    ]);

    return Buffer.concat([
      bufferSignature,
      hashPublicKey,
      rawPublicKey,
      nonce,
      Buffer.from([0x0]),
    ]);
  }

  // Maybe just using https://github.com/ecies/js is better
  // https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/crypto.py#L115
  public async encryptedMessage({
    message,
    responderPublicKey: inputResponderPublicKey,
    iv,
  }: {
    message: Buffer;
    responderPublicKey: Buffer | string;
    iv?: Buffer;
  }): Promise<Buffer> {
    const responderPublicKey = addMissingPublicKeyByte({
      buffer: getBufferFromHex(inputResponderPublicKey),
    });
    return new Promise<Buffer>((resolve, reject) => {
      encrypt(responderPublicKey, message, {
        ephemPrivateKey: this.ephemeralPrivateKey,
        iv,
      })
        .then((e) => resolve(e))
        .catch((err) => reject(err));
    });
  }

  public async decryptMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }): Promise<Buffer> {
    const privateKey = Buffer.from(this.keyPair.privatekey, 'hex');

    return new Promise<Buffer>((resolve, reject) => {
      decrypt(privateKey, encryptedMessage)
        .then((results) => resolve(results))
        .catch((error) => reject(error));
    });
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

    this._assert({
      input: remotePublicKey,
      expectedLength: 65,
      field: 'publickey',
    });
    this._assert({
      input: nonce,
      expectedLength: 32,
      field: 'nonce',
    });
    this._assert({
      input: hash,
      expectedLength: 32,
      field: 'hash',
    });

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

  public decryptPacket({ message }: { message: string }): {
    header: unknown;
    body: unknown;
  } {
    throw new Error('Not implemented');
  }

  public _assert({
    input,
    expectedLength,
    field,
  }: {
    input: Buffer;
    expectedLength: number;
    field: string;
  }) {
    if (input.length !== expectedLength) {
      throw new Error(
        `${field} has invalid length (${input.length}), expected ${expectedLength}`
      );
    }
  }
}
