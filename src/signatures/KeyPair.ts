import secp256k1 from 'secp256k1';
import { keccak256 } from '../utils/keccak256';
import { addMissingPublicKeyByte } from './addMissingPublicKyeByte';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { injectable, inject } from 'inversify';

/*
  TODO: 
    This class is a bit to complicated.
    Agree on a common output, and input.

    I think the simplest would be: 
    input -> string or buffer
    Output -> Buffer
*/
@injectable()
export class KeyPair {
  constructor(@inject<string>('PRIVATE_KEY') public privatekey: string) {}

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

  public getCompressedKey({
    publicKey: inputPublicKey,
  }: {
    publicKey: Buffer | string;
  }): Buffer {
    const publicKey =
      typeof inputPublicKey === 'string'
        ? getBufferFromHex(inputPublicKey)
        : inputPublicKey;
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
        buffer: getBufferFromHex(input),
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
