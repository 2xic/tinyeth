import { ArrayEncoderDecoder } from "./types/ArrayEncoderDecoder";
import { IsNonValueEncoderDecoder } from "./types/IsNonValueEncoderDecoder";
import { SimpleTypeEncoderDecoder } from "./types/SimpleTypeEncoderDecoder";
import { StringEncoderDecoder } from "./types/StringEncoderDecoder";
import { DecodingResults } from "./types/TypeEncoderDecoder";

export class RlpDecoder {
  public parse({ input }: { input: string }): string | undefined {
    const strippedInput = Buffer.from(input.substring(2), "hex");
    let parsed = "";

    let index = 0;
    while (index < strippedInput.length) {
      const { newIndex, decoding } = this.getToken({
        input: strippedInput,
        index,
      });

      parsed += decoding;
      index = newIndex;
    }

    return parsed;
  }

  private getToken({
    input,
    index,
  }: {
    input: Buffer;
    index: number;
  }): DecodingResults {
    const typeValue = input[index];
    const isStringValue = new StringEncoderDecoder().isDecodeType({
      input: typeValue,
    });
    const isSimpleType = new SimpleTypeEncoderDecoder().isDecodeType({
      input: typeValue,
    });
    const isArrayType = new ArrayEncoderDecoder().isDecodeType({
      input: typeValue,
    });
    const isNonValue = new IsNonValueEncoderDecoder().isDecodeType({
      input: typeValue,
    });

    if (isSimpleType) {
      return new SimpleTypeEncoderDecoder().decode({ input, fromIndex: index });
    } else if (isStringValue) {
      const token = new StringEncoderDecoder().decode({
        input,
        fromIndex: index,
      });

      return {
        newIndex: index + 1,
        decoding: token.decoding,
      };
    } else if (isArrayType) {
      return new ArrayEncoderDecoder().decode({
        input,
        fromIndex: index,
        decoder: this.getToken,
      });
    } else if (isNonValue) {
      return new IsNonValueEncoderDecoder().decode({ input, fromIndex: index });
    }

    throw new Error("Not implemented");
  }
}
