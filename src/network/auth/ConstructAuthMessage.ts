import { Signatures } from '../../signatures/Signatures';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';
import { assertEqual } from '../../utils/enforce';
import { inject, injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { xor } from '../../utils/XorBuffer';

@injectable()
export class ConstructAuthMessage {
  constructor(
    private randomNonce: NonceGenerator,
    private keyPair: KeyPair,
    private signatures: Signatures,
    @inject('EMPHERMAL_PRIVATE_KEY')
    private ephemeralPrivateKey: string
  ) {}

  public getSharedFields({ ethNodePublicKey }: { ethNodePublicKey: string }) {
    const nonce = this.randomNonce.generate({
      length: 32,
    });
    const ecdhKey = Buffer.from(
      this.keyPair.getEcdh({
        publicKey: ethNodePublicKey,
      })
    );
    console.log(ecdhKey.toString('hex'));
    assertEqual(ecdhKey.length, 32);

    const tokenXorNonce = xor(ecdhKey, nonce);
    const { fullSignature } = this.signatures.signMessage({
      privateKey: this.ephemeralPrivateKey,
      message: tokenXorNonce,
    });
    const bufferSignature = Buffer.from(fullSignature, 'hex');
    const rawPublicKey = Buffer.from(this.keyPair.getPublicKey(), 'hex');

    return {
      nonce,
      bufferSignature,
      rawPublicKey,
      ecdhKey,
    };
  }
}
