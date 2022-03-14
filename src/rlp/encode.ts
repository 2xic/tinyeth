import { createMetaProperty, isJSDocThisTag } from "typescript";
import { Uint } from "./uint";

export class RlpEncoder {
  public encode({ input }: { input: InputTytpes }) {
    const hexPrefix = "0x";
    const encoded = this._encode({ input });
    return hexPrefix + encoded;
  }

  private _encode({ input }: { input: InputTytpes }): string {
    if (typeof input === "string") {
      if (input.length === 1 && input[0].charCodeAt(0) < 0x80) {
        return input;
      }
      const encodedString = Buffer.from(
        input.split("").map((item) => item.charCodeAt(0))
      ).toString("hex");

      return Buffer.from([0x80 + input.length]).toString("hex") + encodedString;
    } else if (Array.isArray(input)) {
      let output = "";
      input.map((c) => {
        output += this._encode({ input: c });
      });
      return Buffer.from([0xc0 + output.length]).toString("hex") + output;
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
        return Buffer.from([input]).toString("hex");
      } else {
        const { length, bytes } = new Uint().encodeNumber(input);
        return (
          Buffer.from([0x80 + length]).toString("hex") +
          Buffer.from(bytes).toString("hex")
        );
      }
    }
    throw new Error("unknown type");
  }
}

type InputTytpes = string | string[] | number | boolean;
