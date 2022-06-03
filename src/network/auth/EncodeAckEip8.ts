import { injectable, inject } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { GetRandomBytesInteractor } from '../nonce-generator/GetRandomBytesInteractor';

@injectable()
export class EncodeAckEip8 {
  constructor(
    private keyPair: KeyPair,
    private getRandomBytesInteractor: GetRandomBytesInteractor,
    @inject('EMPHERMAL_PRIVATE_KEY')
    private ephemeralPrivateKey: string
  ) {}

  public createACkMessageEip8() {
    const publicKey = getBufferFromHex(
      this.keyPair.getPublicKey({
        privateKey: this.ephemeralPrivateKey,
      })
    );
    const nonce = this.getRandomBytesInteractor.getRandomBytes({ length: 32 });

    return {
      results: [publicKey, nonce, Buffer.from([0x4])],
      header: {
        nonce,
      },
    };
  }
}
