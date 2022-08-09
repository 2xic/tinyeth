import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { AbiUintType } from './AbiUintType';

export class AbiArrayType {
  constructor(private values: Array<number | AbiUintType>) {}

  public get value(): EncodingResults {
    const items = [new AbiUintType(this.values.length), ...this.values];

    if (items.length === 0) {
      return {
        encoding: ''.padStart(64, '0'),
        length: 0,
      };
    }

    const encoding = items
      .map((item) => {
        if (item instanceof AbiUintType) {
          return item.value.encoding;
        } else {
          throw Error('Unknown array datatype');
        }
      })
      .join('');

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
    return true;
  }
}
