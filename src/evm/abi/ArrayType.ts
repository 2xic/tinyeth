import { EncodeToken } from '../../rlp/EncodeToken';
import { ArrayEncoderDecoder } from '../../rlp/types/ArrayEncoderDecoder';
import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';

export class ArrayType {
  constructor(private values: number[]) {}

  public get value(): EncodingResults {
    const encoder = new EncodeToken();
    return {
      encoding: new ArrayEncoderDecoder().encode({
        input: this.values,
        encoder: encoder.encodeToken,
      }).encoding,
      length: 0,
    };
  }

  public get type(): string {
    // This has to be dynamic.
    throw new Error('Not implemented');
  }
}
