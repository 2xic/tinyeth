import { Rlpx } from '../Rlpx';
import { KeyPair } from '../../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './../XorBuffer';
import { keccak256 } from './../keccak256';

export class EncodeAuthPreEip8 {
  constructor(private rlpx: Rlpx) {}

  public createAuthMessagePreEip8({
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
      })
    );
    const tokenXorNonce = xor(ecdhKey, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { signature, recovery } = new KeyPair().signMessage({
      privateKey: this.rlpx.ephemeralPrivateKey.toString('hex'),
      message: tokenXorNonce,
    });

    const bufferSignature = Buffer.concat([signature, Buffer.from([recovery])]);
    const hashPublicKey = keccak256(
      Buffer.from(
        this.rlpx.keyPair.getPublicKey({
          privateKey: this.rlpx.ephemeralPrivateKey.toString('hex'),
        }),
        'hex'
      )
    );
    const rawPublicKey = Buffer.concat([
      Buffer.from([4]),
      Buffer.from(this.rlpx.keyPair.getPublicKey(), 'hex'),
    ]);

    return Buffer.concat([
      bufferSignature,
      hashPublicKey,
      rawPublicKey,
      nonce,
      Buffer.from([0x0]),
    ]);
  }
}
