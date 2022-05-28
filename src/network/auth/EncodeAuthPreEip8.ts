import { Rlpx } from '../Rlpx';
import { KeyPair } from '../../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './../XorBuffer';
import { keccak256 } from './../keccak256';
import { inject, injectable } from 'inversify';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';

@injectable()
export class EncodeAuthPreEip8 {
  constructor(
    private keyPair: KeyPair,
    @inject('EMPHERMAL_PRIVATE_KEY')
    private ephemeralPrivateKey: string
  ) {}

  public createAuthMessagePreEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }): Buffer {
    const nonce = crypto.randomBytes(32);
    const ecdhKey = Buffer.from(
      this.keyPair.getEcdh({
        publicKey: ethNodePublicKey,
      })
    );
    const tokenXorNonce = xor(ecdhKey, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { signature, recovery } = this.keyPair.signMessage({
      privateKey: this.ephemeralPrivateKey,
      message: tokenXorNonce,
    });

    const bufferSignature = Buffer.concat([signature, Buffer.from([recovery])]);
    const hashPublicKey = keccak256(
      Buffer.from(
        this.keyPair.getPublicKey({
          privateKey: this.ephemeralPrivateKey,
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
}
