import { isValueBetween } from './isBetween';
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

/*
  TODO: 
    - The encode and decode function here is a bit to large.
*/
export class StringEncoderDecoder
  implements TypeEncoderDecoder<string | Uint8Array>
{
  public encode({ input }: { input: string | Uint8Array }): EncodingResults {
    const isLongString = 55 < input.length;
    const isUint8Array = input instanceof Uint8Array;
    const firstItem = input[0];
    const firstValue =
      typeof firstItem === 'number' || !firstItem
        ? firstItem
        : firstItem.charCodeAt(0);
    const isShortString = input.length === 1 && firstValue < 0x80;
    const encodedChars = isUint8Array
      ? input.map((item) => item)
      : input.split('').map((item) => item.charCodeAt(0));
    const encodedString = Buffer.from(encodedChars).toString('hex');

    if (isShortString) {
      return {
        encoding: encodedString,
        length: input.length,
      };
    } else if (isLongString) {
      const length = input.length;
      const encodedLength = new Number(length).toString(16);
      const isSingleByte = encodedLength.length <= 2;

      const bytes = encodedLength.padStart(isSingleByte ? 2 : 4, '0');
      const byteLength = isSingleByte ? 1 : 2;

      const firstLength = new Number(0xb7 + byteLength).toString(16);

      return {
        encoding: `${firstLength}${bytes}${encodedString}`,
        length: length + 2,
      };
    }

    const encoding =
      Buffer.from([0x80 + input.length]).toString('hex') + encodedString;
    const bytes = input.length + 1;
    return {
      encoding,
      length: bytes,
    };
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    const isLongString = 0xb7 < input[fromIndex];

    if (isLongString) {
      const byteLength = input[fromIndex++] - 0xb7;
      const inputSlice = input
        .slice(fromIndex, fromIndex + byteLength)
        .toString('hex');
      const length = Number.parseInt(inputSlice, 16);

      const stringSlice = input.slice(
        fromIndex + byteLength,
        fromIndex + byteLength + length
      );

      const aboveAscii = stringSlice.find((item) => item > 127);
      const belowAscii = stringSlice.find((item) => item < 27);
      const newIndex = fromIndex + byteLength + length;

      if (aboveAscii || belowAscii) {
        const decoding = stringSlice.toString('hex');
        return {
          newIndex,
          decoding: `0x${decoding}`,
        };
      }

      const decoding = Buffer.from(stringSlice).toString('ascii');

      return {
        decoding,
        newIndex,
      };
    } else {
      const length = input[fromIndex] - 0x80 + 1;
      const inputSlice = input.slice(fromIndex + 1, fromIndex + length);

      const aboveAscii = inputSlice.find((item) => item > 127);
      const belowAscii = inputSlice.find((item) => item < 27);

      if (aboveAscii || belowAscii) {
        const decoding = inputSlice.toString('hex');
        return {
          newIndex: fromIndex + length,
          decoding: `0x${decoding}`,
        };
      }

      const decoding = Buffer.from(inputSlice).toString('ascii');

      return {
        decoding,
        newIndex: fromIndex + length,
      };
    }
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0x82,
      max: 0xbf,
    });
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return typeof input === 'string' || input instanceof Uint8Array;
  }
}
