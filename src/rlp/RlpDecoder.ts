import { ArrayEncoderDecoder } from "./types/ArrayEncoderDecoder";
import { IsNonValueEncoderDecoder } from "./types/IsNonValueEncoderDecoder";
import { SimpleTypeEncoderDecoder } from "./types/SimpleTypeEncoderDecoder";
import { StringEncoderDecoder } from "./types/StringEncoderDecoder";
import {
  DecodingResults,
  TypeEncoderDecoder,
} from "./types/TypeEncoderDecoder";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeDecoders: Array<TypeEncoderDecoder<any>> = [
      new StringEncoderDecoder(),
      new SimpleTypeEncoderDecoder(),
      new ArrayEncoderDecoder(),
      new IsNonValueEncoderDecoder(),
    ];

    const decoding = typeDecoders.find((item) =>
      item.isDecodeType({ input: typeValue })
    );
    if (decoding) {
      return decoding.decode({
        input,
        fromIndex: index,
        decoder: this.getToken.bind(this),
      });
    }

    throw new Error("Not implemented");
  }
}
