import { isValueBetween } from './isBetween';
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SimpleTypeEncoderDecoder implements TypeEncoderDecoder<any> {
  public encode(): EncodingResults {
    throw new Error('Method not implemented');
  }

  public isEncodeType(): boolean {
    throw new Error('Method not implemented.');
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    let decoding: string | number = input[fromIndex].toString();
    if (!Number.isNaN(decoding)) {
      decoding = Number(decoding);
    }

    return {
      newIndex: fromIndex + 1,
      decoding,
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0x00,
      max: 0x7f,
    });
  }
}
