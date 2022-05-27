import secp256k1 from 'secp256k1';
import crypto from 'crypto';
import { keccak256 } from '../network/keccak256';
import { addMissingPublicKeyByte } from './addMissingPublicKyeByte';
import { derive } from 'ecies-geth';

export class KeyPair {
  constructor(public privatekey = crypto.randomBytes(32).toString('hex')) {}

  public getAddress({ publicKey }: { publicKey: string }) {
    const publicKeyHash = keccak256(Buffer.from(publicKey, 'hex')).toString(
      'hex'
    );

    if (publicKeyHash.length !== 64) {
      throw new Error('Invalid hash');
    }

    const address = publicKeyHash.slice(24);
    return '0x' + address.toLowerCase();
  }

  public getPublicKey(options?: { privateKey?: string; skipSlice?: boolean }) {
    const inputPrivateKey = options?.privateKey
      ? options.privateKey
      : this.privatekey;

    const privateKey = inputPrivateKey.startsWith('0x')
      ? inputPrivateKey.slice(2)
      : inputPrivateKey;
    if (privateKey.length !== 64) {
      throw new Error(
        `Invalid private key length, expected 64 and got ${privateKey.length}`
      );
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const diff = options?.skipSlice ? 0 : 1;
    const expectedSlice = 65 - diff;

    const publicKey = Buffer.from(
      secp256k1.publicKeyCreate(privateKeyBuffer, false)
    ).slice(diff);

    if (publicKey.length !== expectedSlice) {
      throw new Error(
        `Invalid public key, expected length 64 and got ${publicKey.length}`
      );
    }

    return publicKey.toString('hex').toLowerCase();
  }

  public async verifyMessage({
    message,
    signature,
    r,
  }: {
    message: Uint8Array;
    signature: Uint8Array;
    r: number;
  }) {
    const publicKey = secp256k1
      .ecdsaRecover(signature, r, new Uint8Array(Buffer.from(message)), false)
      .slice(1);

    return Buffer.from(publicKey).toString('hex');
  }

  public signTransaction({
    chainId,
    privateKey,
    message,
  }: {
    message: Buffer;
    chainId?: number;
    privateKey: string;
  }) {
    const { signature, recovery } = this.signMessage({
      privateKey,
      message,
    });
    // same as https://github.com/ethereumjs/ethereumjs-util/blob/f51bfcab9e5505dfed4819ef1336f9fc00a12c3d/src/signature.ts#L38
    const r = Buffer.from(signature.slice(0, 32));
    const v = chainId ? recovery + (chainId * 2 + 35) : recovery + 27;
    const s = Buffer.from(signature.slice(32, 64));

    return {
      r,
      v,
      s,
    };
  }

  public hashAndSignMessage({
    privateKey: inputPrivateKey,
    message: inputMessage,
  }: {
    privateKey: string;
    message: string;
  }) {
    const hashBuffer = keccak256(Buffer.from(inputMessage, 'hex'));

    return this.signMessage({
      message: hashBuffer,
      privateKey: inputPrivateKey,
    });
  }

  public signMessage({
    privateKey: inputPrivateKey,
    message,
  }: {
    privateKey: string;
    message: Buffer;
  }) {
    const privateKey = Buffer.from(inputPrivateKey, 'hex');
    if (privateKey.length !== 32) {
      throw new Error('Invalid privatekey');
    }

    if (message.length !== 32) {
      throw new Error('Invalid message length');
    }

    const { signature, recid: recovery } = secp256k1.ecdsaSign(
      message,
      privateKey
    );

    return {
      fullSignature: `${Buffer.from(signature).toString('hex')}0${recovery}`,
      signature,
      recovery,
      message,
    };
  }

  public getPublicKeyFromSignature({
    signature,
    r,
    message,
  }: {
    signature: Uint8Array;
    r: number;
    message: Uint8Array;
  }) {
    return Buffer.from(
      secp256k1.ecdsaRecover(signature, r, message, false).slice(1)
    ).toString('hex');
  }

  public getEcdh({
    publicKey: inputPublicKey,
    privateKey: inputPrivateKey,
  }: {
    publicKey: string;
    privateKey?: string;
  }): Buffer {
    const privateKey = Buffer.from(inputPrivateKey || this.privatekey, 'hex');
    const publicKey = this.parsePublicKey({
      input: inputPublicKey,
    });

    if (privateKey.length !== 32) {
      throw new Error(`Wrong private key length ${privateKey.length}`);
    } else if (publicKey.length !== 65) {
      throw new Error(`Wrong public key length ${publicKey.length}`);
    }

    return Buffer.from(
      secp256k1
        .ecdh(
          new Uint8Array(publicKey),
          new Uint8Array(privateKey),
          { hashfn },
          Buffer.alloc(33)
        )
        .slice(1)
    );
  }

  public async getEcdhGeth({
    publicKey: inputPublicKey,
    privateKey: inputPrivateKey,
  }: {
    publicKey: string;
    privateKey?: string;
  }): Promise<Buffer> {
    const privateKey = Buffer.from(inputPrivateKey || this.privatekey, 'hex');
    const publicKey = this.parsePublicKey({
      input: inputPublicKey,
    });

    if (privateKey.length !== 32) {
      throw new Error(`Wrong private key length ${privateKey.length}`);
    } else if (publicKey.length !== 65) {
      throw new Error(`Wrong public key length ${publicKey.length}`);
    }

    return new Promise((resolve, reject) => {
      derive(privateKey, publicKey)
        .then((value) => resolve(this.getDecompressedKey({ publicKey: value })))
        .catch((err) => reject(err));
    });
  }

  public getCompressedKey({ publicKey }: { publicKey: Buffer }): Buffer {
    const rawKey = this.parsePublicKey({ input: publicKey });
    if (rawKey.length !== 65) {
      throw new Error(`Wrong key length expected 65, but got ${rawKey.length}`);
    }

    return Buffer.from(secp256k1.publicKeyConvert(rawKey, true).slice(1));
  }

  public getDecompressedKey({ publicKey }: { publicKey: Buffer }): Buffer {
    const rawKey =
      publicKey[0] !== 4
        ? Buffer.concat([Buffer.from([3]), publicKey])
        : publicKey;

    if (rawKey.length !== 33) {
      throw new Error(`Wrong key length expected 32, but got ${rawKey.length}`);
    }

    return Buffer.from(secp256k1.publicKeyConvert(rawKey, false).slice(1));
  }

  public parsePublicKey({ input }: { input: string | Buffer }): Buffer {
    if (typeof input === 'string') {
      return addMissingPublicKeyByte({
        buffer: Buffer.from(input, 'hex'),
      });
    } else if (Buffer.isBuffer(input)) {
      return addMissingPublicKeyByte({
        buffer: input,
      });
    }
    return input;
  }
}

// Borrowed from https://github.com/ethereumjs/ethereumjs-monorepo/blob/ade4233ddffffdd146b386de701762196a8c941c/packages/devp2p/src/rlpx/ecies.ts#L22
function hashfn(x: Uint8Array, y: Uint8Array) {
  const pubKey = new Uint8Array(33);
  pubKey[0] = (y[31] & 1) === 0 ? 0x02 : 0x03;
  pubKey.set(x, 1);
  return pubKey;
}
