import { isValueBetween } from './isBetween';
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

export class SimpleTypeEncoderDecoder implements TypeEncoderDecoder<any> {
  public encode({ input }: { input: any }): EncodingResults {
    throw new Error('Method not implemented');
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    throw new Error('Method not implemented.');
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    console.log(fromIndex);
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
    console.log(input);
    return isValueBetween({
      value: input,
      min: 0x00,
      max: 0x7f,
    });
  }
}
