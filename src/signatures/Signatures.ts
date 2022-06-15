import { sign } from 'ecies-geth';
import { PublicKey } from 'eciesjs';
import { injectable } from 'inversify';
import secp256k1 from 'secp256k1';
import { assertEqual } from '../utils/enforce';
import { keccak256 } from '../utils/keccak256';

/*
  TODO: 
    Should cleanup this some when refactoring KeyPair.

    KeyPair could just do calls to Signatures to have a cleaner design.

    Output should be standardized to Buffers
*/
@injectable()
export class Signatures {
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
      throw new Error(
        `Invalid message length, expected 32, but got ${message.length}`
      );
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

  public verify({
    signature,
    publicKey,
    message,
  }: {
    signature: Uint8Array;
    publicKey: Uint8Array;
    message: Uint8Array;
  }) {
    return secp256k1.ecdsaVerify(signature, message, publicKey);
  }
}
