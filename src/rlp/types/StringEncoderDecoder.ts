import { isValueBetween } from './isBetween';
import { StringDecoder } from './StringDecoder';
import { StringEncoder } from './StringEncoder';
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from './TypeEncoderDecoder';

/*
  TODO: 
    - The encode and decode function here is a bit to large.
*/
export class StringEncoderDecoder
  implements TypeEncoderDecoder<string | Uint8Array>
{
  public encode({ input }: { input: string | Uint8Array }): EncodingResults {
    return new StringEncoder().encode({ input });
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    return new StringDecoder().decode({ input, fromIndex });
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0x82,
      max: 0xbf,
    });
  }

  public isEncodeType({ input }: { input: unknown }): boolean {
    return typeof input === 'string' || input instanceof Uint8Array;
  }
}
