import BigNumber from "bignumber.js";
import { BooleanEncoderDecoder } from "./types/BooleanEncoderDecoder";
import { NumberEncoderDecoder } from "./types/NumberEncoderDecoder";
import { StringEncoderDecoder } from "./types/StringEncoderDecoder";
import { EncodingResults } from "./types/TypeEncoderDecoder";

export class RlpEncoder {
  public encode({ input }: { input: InputTypes }) {
    const hexPrefix = "0x";
    const encoded = this._encode({ input }).encoding;
    return hexPrefix + encoded;
  }

  private _encode({ input }: { input: InputTypes }): EncodingResults {
    if (typeof input === "string") {
      return new StringEncoderDecoder().encode({ input });
    } else if (typeof input === "boolean") {
      return new BooleanEncoderDecoder().encode({ input });
    } else if (typeof input === "number" || BigNumber.isBigNumber(input)) {
      return new NumberEncoderDecoder().encode({ input });
    } else if (Array.isArray(input)) {
      let output = "";
      let length = 0;

      input.forEach((inputElement) => {
        const { encoding: encoded, length: encodingLength } = this._encode({
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
    throw new Error("unknown type");
  }
}

type InputTypes = Literal | Literal[];
type Literal = string | number | boolean | BigNumber;
