import BigNumber from "bignumber.js";
import { BigInt } from "./types/BigInt";
import { Uint } from "./uint";

export class RlpEncoder {
  public encode({ input }: { input: InputTypes }) {
    const hexPrefix = "0x";
    const encoded = this._encode({ input }).encoding;
    return hexPrefix + encoded;
  }

  private _encode({ input }: { input: InputTypes }): {
    encoding: string;
    bytes: number;
  } {
    if (typeof input === "string") {
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
    } else if (Array.isArray(input)) {
      let output = "";
      let length = 0;
      input.map((c) => {
        const { encoding: encoded, bytes } = this._encode({ input: c });
        output += encoded;
        length += bytes;

    //    console.log([encoded, bytes, c, length]);
      });

      const encoding = Buffer.from([0xc0 + length]).toString("hex") + output;
      return {
        encoding,
        bytes: 2,
      };
    } else if (typeof input === "boolean") {
      if (input) {
        return {
          encoding: "01",
          bytes: 1,
        };
      } else {
        return {
          encoding: "80",
          bytes: 1,
        };
      }
    } else if (typeof input === "number" || BigNumber.isBigNumber(input)) {
      // Using bignumber as it's easier to work with in javascript
      const bigInput = new BigNumber(input);
      if (bigInput.isZero()) {
        const encoding = "80";
        return {
          encoding,
          bytes: 1,
        };
      } else if (bigInput.isLessThan(128)) {
        const encoding = Buffer.from([bigInput.toNumber()]).toString("hex");
        return {
          encoding,
          bytes: 1,
        };
      } else if (bigInput.isLessThan(Math.pow(2, 64))) {
        const { bytes } = new Uint().encodeNumber(bigInput.toNumber());
        const length = bytes.length;

        const encoding =
          Buffer.from([0x80 + length]).toString("hex") +
          Buffer.from(bytes).toString("hex");

        return {
          encoding,
          bytes: length + 1,
        };
      } else {
        const { encoding, bytes } = new BigInt().encode({
          input: bigInput.toString(16),
        });
        return {
          encoding,
          bytes: bytes + 1,
        };
      }
    }
    throw new Error("unknown type");
  }
}

type InputTypes = Literal | Literal[];
type Literal = string | number | boolean | BigNumber;
