import { NewLineKind } from "typescript";
import { InputTypes, Literal } from "../RlpEncoder";
import { isValueBetween } from "./isBetween";
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from "./TypeEncoderDecoder";

export class ArrayEncoderDecoder implements TypeEncoderDecoder<Array<Literal>> {
  public encode({
    input,
    encoder,
  }: {
    input: Array<Literal>;
    encoder: ({ input }: { input: InputTypes }) => EncodingResults;
  }): EncodingResults {
    let output = "";
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
      const encoding = Buffer.from([0xc0 + length]).toString("hex") + output;
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
        ]).toString("hex") + output;

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
    const length = input[fromIndex] - 0xc0;
    const arrayResults = [];

    let currentIndex = fromIndex + 1;
    while (currentIndex <= fromIndex + length) {
      const results = decoder({ input, index: currentIndex });

      currentIndex = results.newIndex;
      arrayResults.push(results.decoding);
    }

    return {
      decoding: JSON.stringify(arrayResults),
      newIndex: currentIndex,
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0xc1,
      max: 0xf7,
    });
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return Array.isArray(input);
  }
}
