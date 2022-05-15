import { arrayContainsArray } from 'ethereumjs-util';
import { isTemplateSpan } from 'typescript';
import { SimpleTypes } from '../rlp/types/TypeEncoderDecoder';

export class ReadOutRlp {
  constructor(private rlp: SimpleTypes | undefined) {}

  private index = 0;

  public readArray<T>({
    length,
    skip,
    isNumeric,
    valueFetcher,
  }: {
    skip?: number;
    length: number;
    isNumeric?: boolean;
    valueFetcher?: (item: SimpleTypes) => T[];
  }): Array<T> {
    if (Array.isArray(this.rlp)) {
      if (skip) {
        this.index += skip;
      }

      const item = this.rlp[this.index++];

      if (valueFetcher) {
        return valueFetcher(item);
      }

      const valueConverter = (item: T): T => {
        if (isNumeric) {
          if ((item as any).toString().startsWith('0x')) {
            return parseInt(item as unknown as string, 16) as unknown as T;
          }
          console.log([item, isNumeric]);
        }
        return item;
      };
      if (length === 1 && !Array.isArray(item)) {
        return [valueConverter(item as unknown as T)];
      } else if (Array.isArray(item)) {
        return (item.slice(0, length) as unknown as T[]).map((item) =>
          valueConverter(item)
        );
      }
    }
    throw new Error(
      `Trying to read an array that is not an array. Index ${
        this.index
      }, Rlp : ${JSON.stringify(this.rlp)}`
    );
  }
}
