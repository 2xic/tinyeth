/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { SimpleTypes } from './types/TypeEncoderDecoder';

export class ReadOutRlp {
  constructor(private rlp: SimpleTypes | undefined) {}

  private index = 0;

  public readArray<T>({
    length,
    skip,
    convertToNumber,
    valueFetcher,
    isFlat,
    convertToBuffer,
  }: {
    skip?: number;
    length: number;
    convertToNumber?: boolean;
    convertToBuffer?: boolean;
    isFlat?: boolean;
    valueFetcher?: (item: SimpleTypes) => T[];
  }): Array<T> {
    if (Array.isArray(this.rlp)) {
      if (skip) {
        this.index += skip;
      }

      if (isFlat) {
        if (Array.isArray(this.rlp[this.index])) {
          return (this.rlp[this.index++] as unknown as T[]).map((item) =>
            this.valueConverter(item, {
              convertToBuffer,
              convertToNumber,
            })
          );
        }
        return (this.rlp.slice(this.index++) as unknown as T[]).map((item) =>
          this.valueConverter(item, {
            convertToBuffer,
            convertToNumber,
          })
        );
      }

      const item = this.rlp[this.index++];

      if (valueFetcher) {
        return valueFetcher(item);
      }

      if (length === 1 && !Array.isArray(item)) {
        return [
          this.valueConverter(item as unknown as T, {
            convertToBuffer,
            convertToNumber,
          }),
        ];
      } else if (Array.isArray(item)) {
        const arrayLength = length === -1 ? item.length : length;
        return (item.slice(0, arrayLength) as unknown as T[]).map((item) =>
          this.valueConverter(item, {
            convertToBuffer,
            convertToNumber,
          })
        );
      }
    }

    throw new Error(
      `Trying to read an array that is not an array. Index ${
        this.index
      }, Rlp : ${JSON.stringify(this.rlp)}`
    );
  }

  private valueConverter<T>(
    item: T,
    options: { convertToBuffer?: boolean; convertToNumber?: boolean }
  ): T {
    if (options.convertToBuffer) {
      if ((item as any).toString().startsWith('0x')) {
        return getBufferFromHex((item as any).toString()) as unknown as T;
      } else if (typeof item === 'boolean') {
        return Buffer.from([0]) as unknown as T;
      } else if (typeof item === 'string') {
        return Buffer.from(item, 'ascii') as unknown as T;
      } else if (typeof item === 'number') {
        return Buffer.from([item]) as unknown as T;
      }
    } else if (options.convertToNumber) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (Buffer.isBuffer(item)) {
        return parseInt(
          (item as any as Buffer).toString('hex'),
          16
        ) as unknown as T;
      } else if ((item as any).toString().startsWith('0x')) {
        return parseInt(item as unknown as string, 16) as unknown as T;
      } else if (typeof item === 'string') {
        const hexString = Buffer.from(item).toString('hex');
        return parseInt(hexString, 16) as unknown as T;
      }
    }
    return item;
  }
  public get done() {
    if (Array.isArray(this.rlp)) {
      return this.rlp.length <= this.index;
    } else {
      throw new Error('Expected response to be rlp');
    }
  }
}
