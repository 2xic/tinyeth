import secp256k1 from 'secp256k1';
import createKeccakHash from 'keccak';
import crypto from 'crypto';
import _ec from 'elliptic';
import { getBufferFromHash } from '../network/getBufferFromHex';

export class KeyPair {
  constructor(
    public privatekey = crypto.randomBytes(32).toString('hex'),
    private curve = new _ec.ec('secp256k1')
  ) {}

  public getAddress({ publicKey }: { publicKey: string }) {
    const publicKeyHash = createKeccakHash('keccak256')
      .update(Buffer.from(publicKey, 'hex'))
      .digest('hex');
    if (publicKeyHash.length !== 64) {
      throw new Error('Invalid hash');
    }

    const address = publicKeyHash.slice(24);
    return '0x' + address.toLowerCase();
  }

  public getPublicKey(options?: { privateKey: string }) {
    const inputPrivateKey = options ? options.privateKey : this.privatekey;

    const privateKey = inputPrivateKey.startsWith('0x')
      ? inputPrivateKey.slice(2)
      : inputPrivateKey;
    if (privateKey.length !== 64) {
      throw new Error(
        `Invalid private key length, expected 64 and got ${privateKey.length}`
      );
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const publicKeyUINT8Array = secp256k1
      .publicKeyCreate(privateKeyBuffer, false)
      .slice(1);

    if (publicKeyUINT8Array.length !== 64) {
      throw new Error(
        `Invalid public key, expected length 64 and got ${publicKeyUINT8Array.length}`
      );
    }

    const publicKey = Buffer.from(publicKeyUINT8Array);
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
    const hashBuffer = createKeccakHash('keccak256')
      .update(Buffer.from(inputMessage, 'hex'))
      .digest();

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
    const privateKey = new Uint8Array(Buffer.from(inputPrivateKey, 'hex'));
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
    privateKey: string;
  }): Buffer {
    const retrievedKey = this.curve.keyFromPrivate(inputPrivateKey, 'hex');
    const point = this.curve
      .keyFromPublic(this.parsePublicKey({ input: inputPublicKey }))
      .getPublic();
    const sharedKey = retrievedKey.derive(point);

    return getBufferFromHash(sharedKey.toString(16));
  }

  public getCompressedKey({ publicKey }: { publicKey: Buffer }) {
    const rawKey = this.parsePublicKey({ input: publicKey });
    if (rawKey.length !== 65) {
      throw new Error(`Wrong key length expected 65, but got ${rawKey.length}`);
    }

    return secp256k1.publicKeyConvert(rawKey, true).slice(1);
  }

  public parsePublicKey({ input }: { input: string | Buffer }): Buffer {
    if (typeof input === 'string') {
      return this.addMissingPublicKeyByte({
        buffer: Buffer.from(input, 'hex'),
      });
    }
    return input;
  }

  private addMissingPublicKeyByte({ buffer }: { buffer: Buffer }) {
    if (buffer.length === 64) {
      return Buffer.concat([getBufferFromHash('04'), buffer]);
    }
    return buffer;
  }
}
