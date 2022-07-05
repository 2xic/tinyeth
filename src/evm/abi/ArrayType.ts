import { verifyPacketLength } from '../../network/auth/verifyPacketLength';
import { EncodeToken } from '../../rlp/EncodeToken';
import { ArrayEncoderDecoder } from '../../rlp/types/ArrayEncoderDecoder';
import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { Uint } from '../../rlp/types/Uint';
import { UintType } from './UintType';

export class ArrayType {
  constructor(private values: Array<number | UintType>) {}

  public get value(): EncodingResults {
    const isPrimitiveType = this.values.every(
      (item) => typeof item === 'number'
    );
    /*
    if (isPrimitiveType) {
      const encoder = new EncodeToken();
      return {
        encoding: new ArrayEncoderDecoder().encode({
          input: this.values,
          encoder: encoder.encodeToken,
        }).encoding,
        length: 0,
      };
    } else {*/
    // new UintType(this.values.length),
    const items = [...this.values];

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
    // }
  }

  public get type(): string {
    // This has to be dynamic.
    throw new Error('Not implemented');
  }
}
