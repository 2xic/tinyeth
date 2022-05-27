import { Rlpx } from '../Rlpx';
import { KeyPair } from '../../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './../XorBuffer';
import { keccak256 } from './../keccak256';

export class EncodeAuthEip8 {
  constructor(private rlpx: Rlpx) {}

  public createAuthMessageEip8({
    ethNodePublicKey,
    nonce: inputNonce,
  }: {
    ethNodePublicKey: string;
    nonce?: Buffer;
  }): Buffer {
    const nonce = inputNonce || crypto.randomBytes(32);
    const ecdhKey = Buffer.from(
      this.rlpx.keyPair.getEcdh({
        publicKey: ethNodePublicKey,
        privateKey: this.rlpx.keyPair.privatekey,
      })
    );
    const tokenXorNonce = xor(ecdhKey, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { fullSignature } = new KeyPair().signMessage({
      privateKey: this.rlpx.ephemeralPrivateKey.toString('hex'), // this.rlpx.keyPair.privatekey,
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
        this.rlpx.keyPair.getPublicKey({
          privateKey: this.rlpx.ephemeralPrivateKey.toString('hex'),
        }),
        'hex'
      )
    );
    const rawPublicKey = Buffer.from(this.rlpx.keyPair.getPublicKey(), 'hex');

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
}
