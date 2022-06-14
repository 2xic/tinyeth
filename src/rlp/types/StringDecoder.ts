export class StringDecoder {
  public decode({ input, fromIndex }: { input: Buffer; fromIndex: number }) {
    const isLongString = 0xb7 < input[fromIndex];

    if (isLongString) {
      return this.longStringDecode({ input, fromIndex });
    } else {
      const length = input[fromIndex] - 0x80 + 1;
      const inputSlice = input.slice(fromIndex + 1, fromIndex + length);

      const aboveAscii = inputSlice.find((item) => item > 127);
      const belowAscii = inputSlice.find((item) => item < 27);

      if (aboveAscii || belowAscii) {
        const decoding = inputSlice.toString('hex');
        return {
          newIndex: fromIndex + length,
          decoding: `0x${decoding}`,
        };
      }

      const decoding = Buffer.from(inputSlice).toString('ascii');

      return {
        decoding,
        newIndex: fromIndex + length,
      };
    }
  }

  private longStringDecode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }) {
    const byteLength = input[fromIndex++] - 0xb7;
    const inputSlice = input
      .slice(fromIndex, fromIndex + byteLength)
      .toString('hex');
    const length = Number.parseInt(inputSlice, 16);

    const stringSlice = input.slice(
      fromIndex + byteLength,
      fromIndex + byteLength + length
    );

    const aboveAscii = stringSlice.find((item) => item > 127);
    const belowAscii = stringSlice.find((item) => item < 27);
    const newIndex = fromIndex + byteLength + length;

    if (aboveAscii || belowAscii) {
      const decoding = stringSlice.toString('hex');
      return {
        newIndex,
        decoding: `0x${decoding}`,
      };
    }

    const decoding = Buffer.from(stringSlice).toString('ascii');

    return {
      decoding,
      newIndex,
    };
  }
}
