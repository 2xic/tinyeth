import BigNumber from 'bignumber.js';
import { forLoop } from '../../utils/forBigNumberLoop';
import { CACHE_ROUNDS, HASH_BYTES } from './EthHashConstants';
import { injectable } from 'inversify';
import { EthHashHelper } from './EthHashHelpers';
import { assertEqual } from '../../utils/enforce';
import { BigNumberBinaryOperations } from '../../utils/BigNumberBinaryOperations';

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
        const results = this.ethHashHelper.sha3_512({
          buffer: this.ethHashHelper.serialize({
            buffer: set[set.length - 1],
          }),
        });
        assertEqual(results.length, 16);
        set.push(results);
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
            const z = i.minus(1).plus(n).modulo(n).toNumber();

            const array1 = set[z];
            const array2 = set[v];

            assertEqual(array1.length, array2.length);

            const buffer = [...array1].map((item, index) =>
              new BigNumberBinaryOperations(new BigNumber(item))
                .xor(
                  new BigNumberBinaryOperations(new BigNumber(array2[index]))
                )
                .toNumber()
            );

            assertEqual(buffer.length, 16, 'wrong buffer length');

            const serializedBuffer = this.ethHashHelper.serialize({
              buffer,
            });

            const mappedHash = this.ethHashHelper.sha3_512({
              buffer: serializedBuffer,
            });

            set[i.toNumber()] = mappedHash;
          },
        });
      },
    });

    return set;
  }
}
