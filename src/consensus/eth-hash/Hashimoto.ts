import BigNumber from 'bignumber.js';

import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
import {
  HASH_BYTES,
  MIX_BYTES,
  WORD_BYTES,
  ACCESSES,
} from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

export class Hashimoto {
  constructor(protected ethHashHelper: EthHashHelper) {}

  protected _hashimoto({
    header,
    nonce,
    fullSize,
    datasetLookup,
  }: {
    header: Buffer;
    nonce: Buffer;
    fullSize: BigNumber;
    datasetLookup: (value: BigNumber) => Buffer;
  }) {
    const n = fullSize.dividedBy(HASH_BYTES);
    const w = MIX_BYTES.dividedToIntegerBy(WORD_BYTES);
    const mixHashes = MIX_BYTES.dividedBy(HASH_BYTES);

    const s = sha3_256(Buffer.concat([header, nonce.reverse()]));

    let mix: number[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: MIX_BYTES.dividedToIntegerBy(HASH_BYTES),
      callback: () => {
        mix.push(...s);
      },
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: ACCESSES,
      callback: (i) => {
        const mixResults = mix[i.toNumber() % w.toNumber()];
        if (!mixResults) {
          throw new Error(
            `Found no mix match ${mix.length} vs ${i.toNumber() % w.toNumber()}`
          );
        }
        const p = this.ethHashHelper.fnv({
          v1: new BigNumber(i.toNumber() ^ s[0]),
          v2: new BigNumber(mixResults)
            .modulo(n.dividedToIntegerBy(mixHashes))
            .times(mixHashes),
        });
        const newData: number[] = [];
        forLoop({
          startValue: new BigNumber(0),
          endValue: MIX_BYTES.dividedBy(HASH_BYTES),
          callback: (j) => {
            newData.push(...datasetLookup(p.plus(j)));
          },
        });

        mix = mix.map((item, index) => {
          const combined = this.ethHashHelper.fnv({
            v1: new BigNumber(item),
            v2: new BigNumber(newData[index]),
          });

          return combined.toNumber();
        });
      },
    });

    const cmix: BigNumber[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: new BigNumber(mix.length),
      callback: (i) => {
        const mix_i = new BigNumber(mix[i.toNumber()]);
        const mix_i1 = new BigNumber(mix[i.toNumber()]);
        const mix_i2 = new BigNumber(mix[i.toNumber()]);
        const mix_i3 = new BigNumber(mix[i.toNumber()]);

        const results = this.ethHashHelper.fnv({
          v1: this.ethHashHelper.fnv({
            v1: this.ethHashHelper.fnv({
              v1: mix_i,
              v2: mix_i1,
            }),
            v2: mix_i2,
          }),
          v2: mix_i3,
        });

        cmix.push(results);
      },
    });

    return this.ethHashHelper.serialize({
      cmix,
    });
  }
}
