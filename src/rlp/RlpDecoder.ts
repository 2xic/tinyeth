import { SimpleTypeEncoderDecoder } from "./types/SimpleTypeEncoderDecoder";
import { StringEncoderDecoder } from "./types/StringEncoderDecoder";
import { DecodingResults } from "./types/TypeEncoderDecoder";

export class RlpDecoder {
  public parse({ input }: { input: string }): string | undefined {
    const strippedInput = Buffer.from(input.substring(2), "hex");
    let parsed = "";

    let index = 0;
    while (index < strippedInput.length) {
      const { newIndex, decoding } = this.getToken(strippedInput, index);

      parsed += decoding;
      index = newIndex;
    }

    return parsed;
  }

  private getToken(
    input: Buffer,
    index: number
  ): DecodingResults {
    const typeValue = input[index];
    const isStringValue = new StringEncoderDecoder().isDecodeType({
      input: typeValue,
    });
    const isSimpleType = new SimpleTypeEncoderDecoder().isDecodeType({
      input: typeValue,
    })

    if (isSimpleType) {
      return new SimpleTypeEncoderDecoder().decode({ input,  
        fromIndex: index,});
    } else if (isStringValue) {
      const token = new StringEncoderDecoder().decode({
        input,
        fromIndex: index,
      });

      return {
        newIndex: index + 1,
        decoding: token.decoding,
      };
    } else if (typeValue <= 0xf7) {
      const length = typeValue - 0xc0;
      const token: number[] = [...Array(length)].map((_, tokenIndex) =>
        Number(input[1 + index + tokenIndex])
      );
      return {
        newIndex: index + length + 1,
        decoding: JSON.stringify(token),
      };
    }

    throw new Error("Not implemented");
  }
}
