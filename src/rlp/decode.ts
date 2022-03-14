import { createInputFiles } from "typescript";

export class RlpDecoder {
  public parse({ input }: { input: string }): string | undefined {
    const strippedInput = Buffer.from(input.substring(2), "hex");
    let parsed = "";

    let index = 0;
    while (index < strippedInput.length) {
      const { newIndex, token } = this.getToken(strippedInput, index);

      parsed += token;
      index = newIndex;
    }

    return parsed;
  }

  private getToken(
    input: Buffer,
    index: number
  ): {
    newIndex: number;
    token: string | number[];
  } {
    if (input[index] <= 0x7f) {
      return {
        newIndex: index + 1,
        token: input[index].toString(), //String.fromCharCode(input[index]),
      };
    } else if (input[index] <= 0xb7) {
      const length = input[index] - 0x80;
      const token: string = new Array(length)
        .map((_, tokenIndex): string => {
          const char = String.fromCharCode(input[index + tokenIndex]);
          return char;
        })
        .join("");
      return {
        newIndex: index + 1,
        token,
      };
    } else if (input[index] <= 0xf7) {
      const length = input[index] - 0xc0;
      const token: number[] = [...Array(length )].map((_, tokenIndex) =>
          Number(input[1 + index + tokenIndex])
      );
      return {
        newIndex: index + length + 1,
        token: JSON.stringify(token),
      };
    }

    throw new Error("Not implemented");
  }
}
