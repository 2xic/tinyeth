import BigNumber from 'bignumber.js';
import {
  DecodingResults,
  EncodingResults,
  SimpleDecodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

export class UIntEncoderDecoder implements TypeEncoderDecoder<BigNumber> {
  public encode({ input }: { input: BigNumber }): EncodingResults {
    const isUint8 = input.isLessThan(this.powerOfTwo(8));
    const isUint16 = input.isLessThan(this.powerOfTwo(16));
    const isUint24 = input.isLessThan(this.powerOfTwo(24));
    const isUint32 = input.isLessThan(this.powerOfTwo(32));
    const isUint40 = input.isLessThan(this.powerOfTwo(40));
    const isUint48 = input.isLessThan(this.powerOfTwo(48));
    const isUint56 = input.isLessThan(this.powerOfTwo(56));

    if (isUint8) {
      return this.getByteArray({
        input,
        n: 0,
      });
    } else if (isUint16) {
      return this.getByteArray({
        input,
        n: 8,
      });
    } else if (isUint24) {
      return this.getByteArray({
        input,
        n: 16,
      });
    } else if (isUint32) {
      return this.getByteArray({
        input,
        n: 24,
      });
    } else if (isUint40) {
      return this.getByteArray({
        input,
        n: 32,
      });
    } else if (isUint48) {
      return this.getByteArray({
        input,
        n: 40,
      });
    } else if (isUint56) {
      return this.getByteArray({
        input,
        n: 48,
      });
    } else {
      return this.getByteArray({
        input,
        n: 56,
      });
    }
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    throw new Error('Method not implemented.');
  }

  public decode({ input }: { input: Buffer }): SimpleDecodingResults {
    const number = input.toString('hex');
    return {
      decoding: new BigNumber(number, 16),
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    throw new Error('Method not implemented.');
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

  private powerOfTwo(power: number) {
    return Math.pow(2, power);
  }
}
