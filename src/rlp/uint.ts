export class Uint {
  public encodeNumber(input: number): Response {
    const isUint8 = input < shift(1, 8);
    const isUint16 = input < shift(1, 16);
    const isUint24 = input < shift(1, 24);
    const isUint32 = input < shift(1, 32);
    const isUint40 = input < shift(1, 40);
    const isUint48 = input < shift(1, 48);
    const isUint56 = input < shift(1, 56);

    if (isUint8) {
      return {
        bytes: this.getByteArray({
          input,
          n: 0,
        }),
      };
    } else if (isUint16) {
      return {
        bytes: this.getByteArray({
          input,
          n: 8,
        }),
      };
    } else if (isUint24) {
      return {
        bytes: this.getByteArray({
          input,
          n: 16,
        }),
      };
    } else if (isUint32) {
      return {
        bytes: this.getByteArray({
          input,
          n: 24,
        }),
      };
    } else if (isUint40) {
      return {
        bytes: this.getByteArray({
          input,
          n: 32,
        }),
      };
    } else if (isUint48) {
      return {
        bytes: this.getByteArray({
          input,
          n: 40,
        }),
      };
    } else if (isUint56) {
      return {
        bytes: this.getByteArray({
          input,
          n: 48,
        }),
      };
    } else {
      return {
        bytes: this.getByteArray({
          input,
          n: 56,
        }),
      };
    }
  }

  private getByteArray({ input, n }: { input: number; n: number }): Buffer {
    const length = n / 8 + 1;
    const array = [...new Array(length)].map((_, index) => {
      const padding = n - 8 * index;
      if (!padding) {
        return input % 256;
      }
      const data = BigInt(input) >> BigInt(padding);
      return parseInt(data.toString());
    });

    return Buffer.from(array);
  }
}

interface Response {
  bytes: Buffer;
}

function shift(number: number, shift: number) {
  return number * Math.pow(2, shift);
}
