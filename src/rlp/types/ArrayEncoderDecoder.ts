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
      output += encoded;
      length += encodingLength;
    });

    const encoding = Buffer.from([0xc0 + length]).toString("hex") + output;
    return {
      encoding,
      length: 2,
    };
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
}
