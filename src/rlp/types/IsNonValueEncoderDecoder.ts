import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class IsNonValueEncoderDecoder implements TypeEncoderDecoder<any> {
  public encode(): EncodingResults {
    throw new Error('Method not implemented');
  }

  public decode({ fromIndex }: { fromIndex: number }): DecodingResults {
    const decoding = '';

    return {
      newIndex: fromIndex + 1,
      decoding,
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return input == 0x80;
  }

  public isEncodeType(): boolean {
    throw new Error('Method not implemented.');
  }
}
