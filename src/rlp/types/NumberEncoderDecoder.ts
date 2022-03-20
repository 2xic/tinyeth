import BigNumber from "bignumber.js";
import { DecodingResults, EncodingResults, TypeEncoderDecoder } from "./TypeEncoderDecoder";
import { UIntEncoderDecoder } from "./UInt";
import { BigIntEncoderDecoder } from "./BigIntEncoderDecoder";

export class NumberEncoderDecoder
  implements TypeEncoderDecoder<number | BigNumber>
{
  public encode({ input }: { input: number | BigNumber }): EncodingResults {
    // Using bignumber as it's easier to work with in javascript
    const bigInput = new BigNumber(input);
    if (bigInput.isZero()) {
      const encoding = "80";
      return {
        encoding,
        length: 1,
      };
    } else if (bigInput.isLessThan(128)) {
      const encoding = Buffer.from([bigInput.toNumber()]).toString("hex");
      return {
        encoding,
        length: 1,
      };
    } else if (bigInput.isLessThan(Math.pow(2, 64))) {
      const { length: length, encoding: uintEncoding } =
        new UIntEncoderDecoder().encode({
          input: bigInput.toNumber(),
        });

      const encoding =
        Buffer.from([0x80 + length]).toString("hex") + uintEncoding;

      return {
        encoding,
        length: length + 1,
      };
    } else {
      const { encoding, bytes } = new BigIntEncoderDecoder().encode({
        input: bigInput.toString(16),
      });
      return {
        encoding,
        length: bytes + 1,
      };
    }
  }

  public decode({ input }: { input: number | BigNumber }): DecodingResults {
    throw new Error("Method not implemented.");
  }
}
