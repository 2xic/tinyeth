import { UintType } from '../evm';
import { InputTypes } from './RlpEncoder';
import { ArrayEncoderDecoder } from './types/ArrayEncoderDecoder';
import { BooleanEncoderDecoder } from './types/BooleanEncoderDecoder';
import { NumberEncoderDecoder } from './types/NumberEncoderDecoder';
import { StringEncoderDecoder } from './types/StringEncoderDecoder';
import {
  EncodingResults,
  TypeEncoderDecoder,
} from './types/TypeEncoderDecoder';

export class EncodeToken {
  public encodeToken({ input }: { input: InputTypes }): EncodingResults {
    const encoder = ({ input }: { input: InputTypes }): EncodingResults => {
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
          encoder,
        });
      }

      throw new Error('unknown type');
    };
    return encoder({ input });
  }
}
