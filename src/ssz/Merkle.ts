import { convertNumberToBuffer } from '../utils/convertNumberToBuffer';
import { createFixedSizeBuffer } from '../utils/createFixedSizeBuffer';
import { sha3_256 } from '../utils/sha3_256';
import { List } from './types/List';
import { Types } from './types/types';
import { Uint } from './types/Uint';

export class Merkle {
  public merklize(leafs: Array<Types>) {
    const merkelLevels: Array<Array<Buffer>> = [];

    let padded = leafs.map((item) => {
      if (item instanceof List) {
        return [
          createFixedSizeBuffer(
            Buffer.from(item.value.map((item) => item.value)),
            32
          ),
          convertNumberToBuffer(item.value.length, 4),
        ];
      } else if (item instanceof Uint) {
        return convertNumberToBuffer(item.value, 32);
      } else {
        throw new Error('hm?');
      }
    });

    if (padded.length % 2 != 0) {
      padded.push(Buffer.alloc(32));
    }

    while (padded.length) {
      if (padded.length === 1) {
        if (Array.isArray(padded)) {
          merkelLevels.push(padded.flat());
        } else {
          throw new Error('This should not happen');
        }
        break;
      }
      const parsed = [];
      const newPadded = [];
      while (padded.length) {
        let a = padded.shift();
        let b = padded.shift();
        if (!a || !b) {
          throw new Error('Should not happen');
        }
        if (Array.isArray(a)) {
          merkelLevels.push(a);
          a = this.merge(a[0], a[1]);
        }

        if (Array.isArray(b)) {
          merkelLevels.push(b);
          b = this.merge(b[0], b[1]);
        }
        parsed.push(a);
        parsed.push(b);
        newPadded.push(this.merge(a, b));
      }
      merkelLevels.push(parsed);
      padded = newPadded;
    }

    return merkelLevels;
  }

  private merge(a: Buffer, b: Buffer) {
    return sha3_256(Buffer.concat([a, b]));
  }
}
