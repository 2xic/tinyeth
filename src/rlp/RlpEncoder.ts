import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { ArrayEncoderDecoder } from './types/ArrayEncoderDecoder';
import { BooleanEncoderDecoder } from './types/BooleanEncoderDecoder';
import { NumberEncoderDecoder } from './types/NumberEncoderDecoder';
import { StringEncoderDecoder } from './types/StringEncoderDecoder';
import {
  EncodingResults,
  TypeEncoderDecoder,
} from './types/TypeEncoderDecoder';
@injectable()
export class RlpEncoder {
  public encode({ input }: { input: InputTypes }) {
    const hexPrefix = '0x';
    const encoded = this.encodeToken({ input }).encoding;
    return hexPrefix + encoded;
  }

  private encodeToken({ input }: { input: InputTypes }): EncodingResults {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeEncoder: Array<TypeEncoderDecoder<any>> = [
      new StringEncoderDecoder(),
      new BooleanEncoderDecoder(),
      new NumberEncoderDecoder(),
      new ArrayEncoderDecoder(),
    ];
    const encoding = typeEncoder.find((item) => item.isEncodeType({ input }));
    if (encoding) {
      return encoding.encode({
        input,
        encoder: this.encodeToken.bind(this),
      });
    }

    throw new Error('unknown type');
  }
}

export type InputTypes = Literal | Literal[];
export type Literal =
  | string
  | number
  | boolean
  | BigNumber
  | Uint8Array
  | Array<Literal>;
