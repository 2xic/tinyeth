import { EncodingResults } from './TypeEncoderDecoder';

export class StringEncoder {
  public encode({ input }: { input: string | Uint8Array }): EncodingResults {
    const { isLongString, isShortString, encodedString } =
      this.getComputedFields(input);

    if (isShortString) {
      return {
        encoding: encodedString,
        length: input.length,
      };
    } else if (isLongString) {
      const length = input.length;
      const encodedLength = new Number(length).toString(16);
      const isSingleByte = encodedLength.length <= 2;

      const bytes = encodedLength.padStart(isSingleByte ? 2 : 4, '0');
      const byteLength = isSingleByte ? 1 : 2;

      const firstLength = new Number(0xb7 + byteLength).toString(16);

      return {
        encoding: `${firstLength}${bytes}${encodedString}`,
        length: length + 2,
      };
    }

    const encoding =
      Buffer.from([0x80 + input.length]).toString('hex') + encodedString;
    const bytes = input.length + 1;
    return {
      encoding,
      length: bytes,
    };
  }

  private getComputedFields(input: string | Uint8Array) {
    const isLongString = 55 < input.length;
    const isUint8Array = input instanceof Uint8Array;

    const firstItem = input[0];
    const firstValue =
      typeof firstItem === 'number' || !firstItem
        ? firstItem
        : firstItem.charCodeAt(0);

    const isShortString = input.length === 1 && firstValue < 0x80;
    const encodedChars = isUint8Array
      ? input.map((item) => item)
      : input.split('').map((item) => item.charCodeAt(0));
    const encodedString = Buffer.from(encodedChars).toString('hex');

    return {
      encodedChars,
      isShortString,
      isLongString,
      encodedString,
    };
  }
}
