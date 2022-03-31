import BigNumber from 'bignumber.js';
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';
import { UIntEncoderDecoder } from './UIntEncoderDecoder';
import { BigIntEncoderDecoder } from './BigIntEncoderDecoder';

export class NumberEncoderDecoder implements TypeEncoderDecoder<BigNumber> {
  public encode({ input }: { input: BigNumber }): EncodingResults {
    const bigInput = new BigNumber(input);
    if (bigInput.isZero()) {
      const encoding = '80';
      return {
        encoding,
        length: 1,
      };
    } else if (bigInput.isLessThan(128)) {
      const encoding = Buffer.from([bigInput.toNumber()]).toString('hex');
      return {
        encoding,
        length: 1,
      };
    } else if (bigInput.isLessThan(Math.pow(2, 64))) {
      const { length: length, encoding: uintEncoding } =
        new UIntEncoderDecoder().encode({
          input: bigInput,
        });

      const encoding =
        Buffer.from([0x80 + length]).toString('hex') + uintEncoding;

      return {
        encoding,
        length: length + 1,
      };
    } else {
      const { encoding, bytes } = new BigIntEncoderDecoder().encode({
        input: bigInput.toString(16),
      });
      return {
        encoding,
        length: bytes + 1,
      };
    }
  }

  public decode({
    input: inputBuffer,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    const length = inputBuffer[fromIndex] - 0x80;
    const input = inputBuffer.slice(fromIndex + 1, fromIndex + 1 + length);
    const { decoding } = new UIntEncoderDecoder().decode({
      input,
    });

    return {
      decoding: `0x${
        BigNumber.isBigNumber(decoding) ? decoding.toString(16) : decoding
      }`,
      newIndex: fromIndex + length + 1,
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return 0x80 < input && input <= 0x80 + 9;
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return typeof input === 'number' || BigNumber.isBigNumber(input);
  }
}
