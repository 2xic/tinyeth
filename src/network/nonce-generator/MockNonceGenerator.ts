import { inject, injectable } from 'inversify';
import { GetRandomBytesInteractor } from './GetRandomBytesInteractor';
import { NonceGenerator } from './NonceGenerator';

@injectable()
export class MockNonceGenerator implements NonceGenerator {
  constructor(
    @inject<boolean>('SHOULD_RANDOMNESS_BE_DETERMINISTIC')
    private shouldReturnMockNonce: boolean,
    private getRandomBytes: GetRandomBytesInteractor
  ) {}
  private nonceList: Buffer[] = [];

  public setNonces(nonceList: Buffer[]) {
    this.nonceList = nonceList;
  }

  public generate({ length }: { length: number }): Buffer {
    if (!this.shouldReturnMockNonce) {
      return this.getRandomBytes.getRandomBytes({ length });
    }
    const nonce = this.nonceList.shift();

    if (!nonce || nonce.length !== length) {
      throw new Error('Invalid nonce :/');
    } else if (!Buffer.isBuffer(nonce)) {
      throw new Error('Wrong nonce type');
    }

    return nonce;
  }
}
