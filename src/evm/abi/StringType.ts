import { StringEncoder } from '../../rlp/types/StringEncoder';
import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { UintType } from './UintType';

export class StringType {
  constructor(
    private input: string,
    private length: number | undefined = undefined
  ) {}

  public get value(): EncodingResults {
    const lengthEncoding = this.length
      ? new UintType(this.length).value.encoding
      : new UintType(this.input.length).value.encoding;
    const encoding =
      lengthEncoding +
      [...this.input]
        .map((item) => item.charCodeAt(0).toString(16))
        .join('')
        .padEnd(64, '0');
    return {
      encoding,
      length: 0,
    };
  }

  public get type(): string {
    // This has to be dynamic.
    throw new Error('Not implemented');
  }

  public get isDynamic(): boolean {
    return this.length === undefined;
  }
}
