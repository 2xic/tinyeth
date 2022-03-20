import { isValueBetween } from "./isBetween";
import { DecodingResults, EncodingResults, TypeEncoderDecoder } from "./TypeEncoderDecoder";

export class StringEncoderDecoder implements TypeEncoderDecoder<string> {
  public encode({ input }: { input: string }): EncodingResults {
    const isLongString = 55 < input.length;
    const isShortString = input.length === 1 && input[0].charCodeAt(0) < 0x80;
    const encodedChars = input.split("").map((item) => item.charCodeAt(0));
    const encodedString = Buffer.from(encodedChars).toString("hex");

    if (isShortString) {
      return {
        encoding: input,
        length: input.length,
      };
    } else if (isLongString) {
      const length = input.length;
      const firstLength = new Number(0xb7 + 2).toString(16);
      const bytes = new Number(length).toString(16).padStart(4, "0");

      return {
        encoding: `${firstLength}${bytes}${encodedString}`,
        length: length + 3,
      };
    }

    const encoding =
      Buffer.from([0x80 + input.length]).toString("hex") + encodedString;
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
    const length = input[fromIndex] - 0x80;
    console.log([fromIndex, fromIndex + length]);
    const decoding = Buffer.from(
      input.slice(fromIndex, fromIndex + length)
    ).toString("ascii");

    return {
      decoding,
      newIndex: fromIndex + 1,
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0x82,
      max: 0xb7,
    });
  }
}
