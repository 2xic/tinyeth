import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { BigNumberBinaryOperations } from '../../utils/BigNumberBinaryOperations';
import { assertEqual } from '../../utils/enforce';

import { forLoop } from '../../utils/forBigNumberLoop';
import { isNanOrFalsy } from '../../utils/isNanOrFalsy';
import {
  HASH_BYTES,
  MIX_BYTES,
  WORD_BYTES,
  ACCESSES,
} from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

@injectable()
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
    datasetLookup: (value: BigNumber) => number[];
  }) {
    const n = fullSize.dividedToIntegerBy(HASH_BYTES);
    const w = MIX_BYTES.dividedToIntegerBy(WORD_BYTES);
    const mixHashes = MIX_BYTES.dividedBy(HASH_BYTES);

    const s = this.ethHashHelper.sha3_512({
      buffer: Buffer.concat([header, nonce.reverse()]),
    });

    let mix: number[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: MIX_BYTES.dividedToIntegerBy(HASH_BYTES),
      callback: () => {
        mix.push(...s);
      },
    });
    assertEqual(mix.length, 32, 'test');

    forLoop({
      startValue: new BigNumber(0),
      endValue: ACCESSES,
      callback: (i) => {
        const mixIndex = mix[i.toNumber() % w.toNumber()];
        assertEqual(isNanOrFalsy(mixIndex), false, 'mixIndex is nan');

        const v1 = new BigNumberBinaryOperations(i).xor(
          new BigNumberBinaryOperations(new BigNumber(s[0]))
        );

        const v2 = new BigNumber(mixIndex); //.modulo(moduloResults);

        assertEqual(isNanOrFalsy(v1), false, 'number is nan');
        assertEqual(isNanOrFalsy(v2.toNumber()), false, 'number is nan');

        const p = this.ethHashHelper
          .fnv({
            v1,
            v2,
          })
          .modulo(n.dividedToIntegerBy(mixHashes))
          .times(mixHashes);

        const newData: number[] = [];
        forLoop({
          startValue: new BigNumber(0),
          endValue: MIX_BYTES.dividedBy(HASH_BYTES),
          callback: (j) => {
            newData.push(...datasetLookup(p.plus(j)));
          },
        });

        assertEqual(
          newData.length,
          mix.length,
          'mix and data should be same length'
        );

        mix = mix.map((item, index) => {
          assertEqual(
            index < newData.length,
            true,
            'index greater than data size'
          );
          assertEqual(isNanOrFalsy(item), false, 'number is nan');
          assertEqual(isNanOrFalsy(newData[index]), false, 'number is nan');

          const combined = this.ethHashHelper.fnv({
            v1: new BigNumber(item),
            v2: new BigNumber(newData[index]),
          });

          const results = combined.toNumber();
          assertEqual(isNanOrFalsy(results), false, 'number is nan');

          return results;
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
      buffer: cmix,
    });
  }
}
