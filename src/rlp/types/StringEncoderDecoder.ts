import { Results, TypeEncoderDecoder } from "./TypeEncoderDecoder";

export class StringEncoderDecoder implements TypeEncoderDecoder<string> {
  public encode({ input }: { input: string }): Results {
    const isLongString = 55 < input.length;
    const isShortString = input.length === 1 && input[0].charCodeAt(0) < 0x80;
    const encodedChars = input.split("").map((item) => item.charCodeAt(0));
    const encodedString = Buffer.from(encodedChars).toString("hex");

    if (isShortString) {
      return {
        encoding: input,
        bytes: input.length,
      };
    } else if (isLongString) {
      const length = input.length;
      const firstLength = new Number(0xb7 + 2).toString(16);
      const bytes = new Number(length).toString(16).padStart(4, "0");

      return {
        encoding: `${firstLength}${bytes}${encodedString}`,
        bytes: length + 3,
      };
    }

    const encoding =
      Buffer.from([0x80 + input.length]).toString("hex") + encodedString;
    const bytes = input.length + 1;
    return {
      encoding,
      bytes,
    };
  }

  public decode({ input }: { input: string }): Results {
    throw new Error("Method not implemented.");
  }
}
