import BigNumber from 'bignumber.js';
import { EncodingResults } from './TypeEncoderDecoder';

export class Uint {
  constructor(
    private options: {
      input: BigNumber;
      n: number;
    }
  ) {}

  public get value() {
    return this.getByteArray({
      ...this.options,
    });
  }

  private getByteArray({
    input,
    n,
  }: {
    input: BigNumber;
    n: number;
  }): EncodingResults {
    const length = n / 8 + 1;
    const array = [...new Array(length)].map((_, index) => {
      const padding = n - 8 * index;
      if (!padding) {
        return input.modulo(256).toNumber();
      }
      const data = BigInt(input.toString()) >> BigInt(padding);
      return new BigNumber(data.toString()).toNumber();
    });

    return {
      length: array.length,
      encoding: Buffer.from(array).toString('hex'),
    };
  }
}
