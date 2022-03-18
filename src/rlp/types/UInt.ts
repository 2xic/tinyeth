import { Results, TypeEncoderDecoder } from "./TypeEncoderDecoder";

export class UIntEncoderDecoder implements TypeEncoderDecoder<number> {
  public encode({ input }: { input: number }): Results {
    const isUint8 = input < this.powerOfTwo(8);
    const isUint16 = input < this.powerOfTwo(16);
    const isUint24 = input < this.powerOfTwo(24);
    const isUint32 = input < this.powerOfTwo(32);
    const isUint40 = input < this.powerOfTwo(40);
    const isUint48 = input < this.powerOfTwo(48);
    const isUint56 = input < this.powerOfTwo(56);

    if (isUint8) {
      return this.getByteArray({
        input,
        n: 0,
      });
    } else if (isUint16) {
      return this.getByteArray({
        input,
        n: 8,
      });
    } else if (isUint24) {
      return this.getByteArray({
        input,
        n: 16,
      });
    } else if (isUint32) {
      return this.getByteArray({
        input,
        n: 24,
      });
    } else if (isUint40) {
      return this.getByteArray({
        input,
        n: 32,
      });
    } else if (isUint48) {
      return this.getByteArray({
        input,
        n: 40,
      });
    } else if (isUint56) {
      return this.getByteArray({
        input,
        n: 48,
      });
    } else {
      return this.getByteArray({
        input,
        n: 56,
      });
    }
  }

  public decode({ input }: { input: number; }): Results {
    throw new Error("Method not implemented.");
  }

  private getByteArray({ input, n }: { input: number; n: number }): Results {
    const length = n / 8 + 1;
    const array = [...new Array(length)].map((_, index) => {
      const padding = n - 8 * index;
      if (!padding) {
        return input % 256;
      }
      const data = BigInt(input) >> BigInt(padding);
      return parseInt(data.toString());
    });

    return {
      bytes: array.length,
      encoding: Buffer.from(array).toString('hex'),
    };
  }

  private powerOfTwo(power: number) {
    return Math.pow(2, power);
  }
}
