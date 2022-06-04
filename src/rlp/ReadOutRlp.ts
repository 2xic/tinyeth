import { SimpleTypes } from './types/TypeEncoderDecoder';

export class ReadOutRlp {
  constructor(private rlp: SimpleTypes | undefined) {}

  private index = 0;

  public readArray<T>({
    length,
    skip,
    isNumeric,
    valueFetcher,
    isFlat,
  }: {
    skip?: number;
    length: number;
    isNumeric?: boolean;
    isFlat?: boolean;
    valueFetcher?: (item: SimpleTypes) => T[];
  }): Array<T> {
    if (Array.isArray(this.rlp)) {
      if (skip) {
        this.index += skip;
      }

      if (isFlat) {
        if (Array.isArray(this.rlp[this.index])) {
          return this.rlp[this.index++] as unknown as T[];
        }
        return this.rlp.slice(this.index++) as unknown as T[];
      }

      const item = this.rlp[this.index++];

      if (valueFetcher) {
        return valueFetcher(item);
      }

      const valueConverter = (item: T): T => {
        if (isNumeric) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (Buffer.isBuffer(item)) {
            return parseInt(
              (item as any as Buffer).toString('hex'),
              16
            ) as unknown as T;
          } else if ((item as any).toString().startsWith('0x')) {
            return parseInt(item as unknown as string, 16) as unknown as T;
          }
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
