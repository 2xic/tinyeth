import { injectable } from 'inversify';
import { NonceGenerator } from './NonceGenerator';

@injectable()
export class MockNonceGenerator implements NonceGenerator {
  private nonceList: Buffer[] = [];

  public setNonces(nonceList: Buffer[]) {
    this.nonceList = nonceList;
  }

  public generate({ length }: { length: number }): Buffer {
    const nonce = this.nonceList.shift();

    if (!nonce || nonce.length !== length) {
      throw new Error('Invalid nonce :/');
    }

    return nonce;
  }
}
