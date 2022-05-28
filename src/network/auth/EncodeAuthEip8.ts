import { KeyPair } from '../../signatures/KeyPair';
import { xor } from './../XorBuffer';
import { inject, injectable } from 'inversify';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';

@injectable()
export class EncodeAuthEip8 {
  constructor(
    private keyPair: KeyPair,
    private randomNonce: NonceGenerator,
    @inject('EMPHERMAL_PRIVATE_KEY')
    private ephemeralPrivateKey: string
  ) {}

  public createAuthMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    const nonce = this.randomNonce.generate({
      length: 32,
    });
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
    const { fullSignature } = this.keyPair.signMessage({
      privateKey: this.ephemeralPrivateKey, // this.rlpx.keyPair.privatekey,
      message: tokenXorNonce,
    });
    const bufferSignature = Buffer.from(fullSignature, 'hex');
    if (bufferSignature.length !== 65) {
      throw new Error(
        `Something is wrong with the signature function, expected length 65, but received ${bufferSignature.length}`
      );
    }
    const rawPublicKey = Buffer.from(this.keyPair.getPublicKey(), 'hex');

    if (rawPublicKey.length !== 64) {
      throw new Error(
        `Wrong raw key length, expected 64, but got ${rawPublicKey.length}`
      );
    }

    return {
      results: [bufferSignature, rawPublicKey, nonce, Buffer.from([0x4])],
      header: {
        secret: ecdhKey,
        nonce,
      },
    };
  }
}
