import BigNumber from 'bignumber.js';
import { forLoop } from '../../utils/forBigNumberLoop';
import { CACHE_ROUNDS, HASH_BYTES } from './EthHashConstants';
import { injectable } from 'inversify';
import { EthHashHelper } from './EthHashHelpers';
import { assertEqual } from '../../utils/enforce';

@injectable()
export class EthHashCache {
  constructor(private ethHashHelper: EthHashHelper) {}

  public makeCache({
    cacheSize,
    seed,
  }: {
    cacheSize: BigNumber;
    seed: Buffer;
  }): number[][] {
    const n = cacheSize.dividedToIntegerBy(HASH_BYTES);
    const set = [
      this.ethHashHelper.sha3_512({
        buffer: seed,
      }),
    ];

    if (!n.isFinite()) {
      throw new Error('size was not finite. Something is wrong.');
    }

    forLoop({
      startValue: new BigNumber(1),
      endValue: n,
      callback: () => {
        set.push(
          this.ethHashHelper.sha3_512({
            buffer: this.ethHashHelper.serialize({
              buffer: set[set.length - 1],
            }),
          })
        );
      },
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: CACHE_ROUNDS,
      callback: () => {
        forLoop({
          startValue: new BigNumber(0),
          endValue: n,
          callback: (i) => {
            const v = set[i.toNumber()][0] % n.toNumber();

            const array1 = set[i.minus(1).plus(n).modulo(n).toNumber()];
            const array2 = set[v];

            assertEqual(array1.length, array2.length);

            const buffer = [...array1].map(
              (item, index) => item ^ array2[index]
            );

            const mappedHash = this.ethHashHelper.sha3_512({
              buffer: this.ethHashHelper.serialize({
                buffer,
              }),
            });

            set[i.toNumber()] = mappedHash;
          },
        });
      },
    });

    return set;
  }
}
