import BigNumber from "bignumber.js";
import { ArrayEncoderDecoder } from "./types/ArrayEncoderDecoder";
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
      return new ArrayEncoderDecoder().encode({
        encoder: this._encode,
        input,
      })
    }
    throw new Error("unknown type");
  }
}

export type InputTypes = Literal | Literal[];
export type Literal = string | number | boolean | BigNumber;
