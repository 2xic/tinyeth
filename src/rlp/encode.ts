import { isJSDocThisTag } from "typescript";

export class RlpEncoder {
  public encode({ input }: { input: InputTytpes }) {
    return (
      "0x" +
      Array(this._encode({ input }))
        .map((c) => {
          const isNumber = /^\d+$/.test(c);
          if (isNumber) {
            return c;
          }
          return c.charCodeAt(0).toString(16);
        })
        .join("")
    );
  }

  private _encode({ input }: { input: InputTytpes }): string {
    if (typeof input === "string") {
      if (input.length === 1 && input[0].charCodeAt(0) < 0x80) {
        return input;
      }
      return (
        this.encodeLength({
          length: input.length,
          offset: 0x80,
        }) + input
      );
    } else if (Array.isArray(input)) {
      let output = "";
      input.map((c) => {
        output += this._encode({ input: c });
      });
      return (
        this.encodeLength({
          length: output.length,
          offset: 0xc0,
        }) + output
      );
    } else if (typeof input === "boolean") {
      if (input) {
        return "01";
      } else {
        return "80";
      }
    } else if (typeof input === "number") {
      if (input === 0) {
        return "80";
      } else if (input < 128) {
        return this.toBinary({ input });
      } else {
        throw new Error("Not implemented");
      }
    }
    throw new Error("unknown type");
  }

  private encodeLength({
    length,
    offset,
  }: {
    length: number;
    offset: number;
  }): string {
    if (length < 56) {
      return String.fromCharCode(length + offset);
    } else if (length < 256 ** 8) {
      const binary = this.toBinary({ input: length });
      return String.fromCharCode(binary.length + offset + 55) + binary;
    } else {
      throw new Error("Input too long");
    }
  }

  private toBinary({ input }: { input: number }): string {
    if (input == 0) {
      return "";
    }
    return (
      this.toBinary({ input: parseInt((input / 256).toString()) }) +
      String.fromCharCode(input % 256)
    );
  }
}

type InputTytpes = string | string[] | number | boolean;
