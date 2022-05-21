import BigNumber from 'bignumber.js';
import { EncodingResults } from './TypeEncoderDecoder';

export class Uint {
  constructor(
    private options: {
      input: BigNumber;
      n: number;
      type?: string;
    }
  ) {}

  public get value() {
    return this.getByteArray({
      ...this.options,
    });
  }

  public get type() {
    if (!this.options.type) {
      throw new Error('Type not set');
    }
    return this.options.type;
  }

  private getByteArray({
    input,
    n,
  }: {
    input: BigNumber;
    n: number;
  }): EncodingResults {
    let inputValue = input;
    const length = n / 8;
    const array = [...new Array(length)]
      .map(() => {
        const value = inputValue.modulo(256);
        inputValue = inputValue.dividedToIntegerBy(256);
        return value.toNumber();
      })
      .reverse();

    return {
      length: array.length,
      encoding: Buffer.from(array).toString('hex'),
    };
  }
}
