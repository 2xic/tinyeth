import BigNumber from 'bignumber.js';
import {
  DecodingResults,
  EncodingResults,
  SimpleDecodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';
import { Uint } from './Uint';

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
      return new Uint({
        input,
        n: 0,
      }).value;
    } else if (isUint16) {
      return new Uint({
        input,
        n: 8,
      }).value;
    } else if (isUint24) {
      return new Uint({
        input,
        n: 16,
      }).value;
    } else if (isUint32) {
      return new Uint({
        input,
        n: 24,
      }).value;
    } else if (isUint40) {
      return new Uint({
        input,
        n: 32,
      }).value;
    } else if (isUint48) {
      return new Uint({
        input,
        n: 40,
      }).value;
    } else if (isUint56) {
      return new Uint({
        input,
        n: 48,
      }).value;
    } else {
      return new Uint({
        input,
        n: 56,
      }).value;
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

  private powerOfTwo(power: number) {
    return Math.pow(2, power);
  }
}
