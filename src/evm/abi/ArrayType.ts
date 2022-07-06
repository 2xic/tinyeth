import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { UintType } from './UintType';

export class ArrayType {
  constructor(private values: Array<number | UintType>) {}

  public get value(): EncodingResults {
    const items = [new UintType(this.values.length), ...this.values];

    if (items.length === 0) {
      return {
        encoding: ''.padStart(64, '0'),
        length: 0,
      };
    }

    return {
      encoding: items
        .map((item) => {
          if (item instanceof UintType) {
            return item.value.encoding;
          } else {
            throw Error('unknown');
          }
        })
        .join(''),
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
