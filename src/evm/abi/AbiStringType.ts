import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { AbiUintType } from './AbiUintType';

export class AbiStringType {
  constructor(
    private input: string,
    private length: number | undefined = undefined
  ) {}

  public get value(): EncodingResults {
    const lengthEncoding = this.length
      ? ''
      : new AbiUintType(this.input.length).value.encoding;
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
