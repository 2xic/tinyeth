import { Uint } from "./uint";

export class BigInt {
  constructor() {}

  public encode({ input }: { input: string }): {
    encoding: string;
    bytes: number;
  } {
    const bitsLength = this.bitSize(parseInt(input, 16));
    const length = this.getLengthHeader({ bitsLength });
    const encodedArray = Uint8Array.from(Buffer.from(input, "hex"));
    const encoded = Buffer.from(encodedArray).toString("hex");

    return {
      encoding: `${length.toString(16)}${encoded}`,
      bytes: encodedArray.length,
    };
  }

  private getLengthHeader({ bitsLength }: { bitsLength: number }) {
    // same as https://github.com/ethereum/go-ethereum/blob/afe9558bba80727f40ac214276b0c0bbb1b237a0/rlp/encbuffer.go#L142
    const minimumRequiredBytes = ((bitsLength + 7) & -8) >> 3;
    if (minimumRequiredBytes < 56) {
      return 0x80 + minimumRequiredBytes;
    } else {
      throw new Error("Not implemented");
    }
  }

  private bitSize(num: Number) {
    return num.toString(2).length;
  }
}
