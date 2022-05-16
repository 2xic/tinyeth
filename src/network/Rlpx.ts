import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
//import { encrypt } from 'eciesjs';
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
        //   privateKey: this.keyPair.privatekey,
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
    return new Promise<Buffer>((resolve, reject) => {
      decrypt(Buffer.from(this.keyPair.privatekey, 'hex'), encryptedMessage)
        .then((e) => resolve(e))
        .catch((err) => reject(err));
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

  /*
    Added for testing only, based off vaporyjs-devp2p2, will be removed soon.
  */
  public async getEncryptedAuthMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    const authMessage = this.createAuthMessageEip8({
      ethNodePublicKey,
    });
    const dataRLP = new RlpEncoder().encode({ input: authMessage });
    const pad = crypto.randomBytes(100 + Math.floor(Math.random() * 151)); // Random padding between 100, 250
    const authMsg = Buffer.concat([getBufferFromHex(dataRLP), pad]);
    const overheadLength = 113;

    const lengthHex = (authMsg.length + overheadLength).toString(16);
    const sharedMacData = Buffer.from(
      lengthHex.length % 2 == 1 ? '0' + lengthHex : lengthHex,
      'hex'
    );

    const _encryptMessage = (data: Buffer, sharedMacData: Buffer) => {
      /*
       */
      function ecdhX(publicKey: Buffer, privateKey: Buffer) {
        // return (publicKey * privateKey).x
        return secp256k1
          .ecdh(
            Buffer.concat([Buffer.from('04', 'hex'), publicKey]),
            privateKey
          )
          .slice(1);
      }

      function concatKDF(keyMaterial: Uint8Array, keyLength: number) {
        const SHA256BlockSize = 64;
        const reps = ((keyLength + 7) * 8) / (SHA256BlockSize * 8);

        const buffers = [];
        for (let counter = 0, tmp = Buffer.allocUnsafe(4); counter <= reps; ) {
          counter += 1;
          tmp.writeUInt32BE(counter);
          buffers.push(
            crypto.createHash('sha256').update(tmp).update(keyMaterial).digest()
          );
        }

        return Buffer.concat(buffers).slice(0, keyLength);
      }

      const privateKey = crypto.randomBytes(32);
      const x = ecdhX(Buffer.from(ethNodePublicKey, 'hex'), privateKey);
      const key = concatKDF(x, 32);
      const ekey = key.slice(0, 16); // encryption key
      /*
      const key = new KeyPair().getEcdh({
        publicKey: ethNodePublicKey,
        privateKey: privateKey.toString('hex'),
      });
      const ekey = key.slice(0, 16);
      */
      const mkey = crypto
        .createHash('sha256')
        .update(key.slice(16, 32))
        .digest(); // MAC key

      // encrypt
      const IV = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-128-ctr', ekey, IV);
      const encryptedData = cipher.update(data);
      const dataIV = Buffer.concat([IV, encryptedData]);

      // create tag
      if (!sharedMacData) {
        sharedMacData = Buffer.from([]);
      }
      const tag = crypto
        .createHmac('sha256', mkey)
        .update(Buffer.concat([dataIV, sharedMacData]))
        .digest();

      const publicKey = new KeyPair(privateKey.toString('hex')).getPublicKey(); // secp256k1.publicKeyCreate(privateKey, false);
      return Buffer.concat([Buffer.from(publicKey, 'hex'), dataIV, tag]);
    };

    return Buffer.concat([
      sharedMacData,
      _encryptMessage(authMsg, sharedMacData),
    ]);
  }

  public decryptPacket({ message }: { message: string }): {
    header: unknown;
    body: unknown;
  } {
    throw new Error('Not implemented');
  }
}
