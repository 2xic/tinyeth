import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

export class BooleanEncoderDecoder implements TypeEncoderDecoder<boolean> {
  public encode({ input }: { input: boolean }): EncodingResults {
    if (input) {
      return {
        encoding: '01',
        length: 1,
      };
    } else {
      return {
        encoding: '80',
        length: 1,
      };
    }
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    if (input[fromIndex] === 0x01) {
      return {
        decoding: true,
        newIndex: fromIndex + 1,
      };
    } else {
      return {
        decoding: false,
        newIndex: fromIndex + 1,
      };
    }
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return input == 0x01 || input === 0x80;
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return typeof input === 'boolean';
  }
}
