import { StringEncoder } from '../../rlp/types/StringEncoder';
import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';

export class StringType {
  constructor(private input: string) {}

  public get value(): EncodingResults {
    return {
      encoding: new StringEncoder().encode({
        input: this.input,
      }).encoding,
      length: 0,
    };
  }

  public get type(): string {
    // This has to be dynamic.
    throw new Error('Not implemented');
  }
}
