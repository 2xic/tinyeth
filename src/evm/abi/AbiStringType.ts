import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { AbiUintType } from './AbiUintType';

export class AbiStringType {
  constructor(
    private input: string,
    private length: number | undefined = undefined
  ) {}

  public get value(): EncodingResults {
    const encoding = this.lengthEncoding + this.itemEncoding;

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

  private get lengthEncoding() {
    return this.length ? '' : new AbiUintType(this.input.length).value.encoding;
  }

  private get itemEncoding() {
    return [...this.input]
      .map((item) => item.charCodeAt(0).toString(16))
      .join('')
      .padEnd(64, '0');
  }
}
