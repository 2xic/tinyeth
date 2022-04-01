import { InputTypes, Literal } from '../RlpEncoder';
import { isValueBetween } from './isBetween';
import { SimpleTypeEncoderDecoder } from './SimpleTypeEncoderDecoder';
import {
  DecodingResults,
  EncodingResults,
  SimpleTypes,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

export class ArrayEncoderDecoder implements TypeEncoderDecoder<Array<Literal>> {
  public encode({
    input,
    encoder,
  }: {
    input: Array<Literal>;
    encoder: ({ input }: { input: InputTypes }) => EncodingResults;
  }): EncodingResults {
    let output = '';
    let length = 0;

    input.forEach((inputElement) => {
      const { encoding: encoded, length: encodingLength } = encoder({
        input: inputElement,
      });
      if (Array.isArray(inputElement)) {
        length += 1;
      }
      output += encoded;
      length += encodingLength;
    });

    if (length < 55) {
      const encoding = Buffer.from([0xc0 + length]).toString('hex') + output;
      return {
        encoding,
        length,
      };
    } else {
      const lengthInHex = length.toString(16);
      const paddingLength = lengthInHex.padStart(lengthInHex.length % 2);

      const encoding =
        Buffer.from([
          0xf7 + Math.ceil(parseFloat(paddingLength.length.toString()) / 2),
          parseInt(paddingLength, 16),
        ]).toString('hex') + output;

      return {
        encoding,
        length: 3,
      };
    }
  }

  public decode({
    input,
    fromIndex,
    decoder,
  }: {
    input: Buffer;
    fromIndex: number;
    decoder: ({
      input,
      index,
    }: {
      input: Buffer;
      index: number;
    }) => DecodingResults;
  }): DecodingResults {
    if (input[fromIndex] === 0xc0) {
      return {
        decoding: [],
        newIndex: fromIndex + 1,
      };
    } else if (0xf7 < input[fromIndex]) {
      const lengthOfLengthBuffer = input[fromIndex++] - 0xf7;
      const actualLength = Number.parseInt(
        input
          .slice(fromIndex, fromIndex + lengthOfLengthBuffer)
          .toString('hex'),
        16
      );
      const arrayResults: SimpleTypes[] = [];

      let currentIndex = fromIndex + lengthOfLengthBuffer;
      while (currentIndex <= fromIndex + actualLength) {
        const results = decoder({ input, index: currentIndex });

        currentIndex = results.newIndex;
        arrayResults.push(results.decoding);
      }

      return {
        decoding: arrayResults,
        newIndex: currentIndex,
      };
    } else {
      const length = input[fromIndex] - 0xc0;
      const arrayResults: SimpleTypes[] = [];

      let currentIndex = fromIndex + 1;
      while (currentIndex <= fromIndex + length) {
        const results = decoder({ input, index: currentIndex });

        currentIndex = results.newIndex;
        arrayResults.push(results.decoding);
      }

      return {
        decoding: arrayResults,
        newIndex: currentIndex,
      };
    }
  }

  public isDecodeType({ input }: { input: number }): boolean {
    const isLongArray = isValueBetween({
      value: input,
      min: 0xc1,
      max: 0xff,
    });
    const isSingleElement = input === 0xc0;

    return isLongArray || isSingleElement;
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return Array.isArray(input);
  }
}
