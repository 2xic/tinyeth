import { NonceGenerator } from './NonceGenerator';

export class MockNonceGenerator implements NonceGenerator {
  constructor(private nonceList: Buffer[]) {}

  public generate({ length }: { length: number }): Buffer {
    const nonce = this.nonceList.shift();

    if (!nonce || nonce.length !== length) {
      throw new Error('Invalid nonce :/');
    }

    return nonce;
  }
}
