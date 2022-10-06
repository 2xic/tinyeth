import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { BigNumberBinaryOperations } from '../../utils/BigNumberBinaryOperations';
import { assertEqual } from '../../utils/enforce';
import { forLoop } from '../../utils/forBigNumberLoop';
import { DATASET_PARENTS, HASH_BYTES, WORD_BYTES } from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

@injectable()
export class EthHashDataset {
  constructor(private ethHashHelper: EthHashHelper) {}

  public calculateDataset({
    fullSize,
    cache,
  }: {
    fullSize: BigNumber;
    cache: number[][];
  }): number[][] {
    const size = fullSize.dividedToIntegerBy(HASH_BYTES);
    const results = [...new Array(size.toNumber())].map((_, index) =>
      this.calculateDatasetItem({
        cache,
        i: new BigNumber(index),
      })
    );

    return results;
  }

  public calculateDatasetItem({
    cache,
    i,
  }: {
    cache: number[][];
    i: BigNumber;
  }): number[] {
    const converter = (item: number[]) =>
      this.ethHashHelper.serialize({
        buffer: item,
      });
    const size = cache.length;
    const r = HASH_BYTES.dividedToIntegerBy(WORD_BYTES);

    let mix: number[] = [...cache[i.modulo(size).toNumber()]];
    mix[0] = new BigNumberBinaryOperations(new BigNumber(mix[0]))
      .xor(new BigNumberBinaryOperations(i))
      .toNumber();

    mix = this.ethHashHelper.sha3_512({
      buffer: converter(mix),
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: DATASET_PARENTS,
      callback: (j) => {
        const cacheIndex = this.ethHashHelper.fnv({
          v1: new BigNumberBinaryOperations(i).xor(
            new BigNumberBinaryOperations(j)
          ),
          v2: new BigNumber(mix[j.modulo(r).toNumber()]),
        });
        assertEqual(!!mix, true, 'mix is undefined');
        assertEqual(cacheIndex.isGreaterThan(0), true, 'Mix is underflow');

        const cacheItem = cache[cacheIndex.modulo(size).toNumber()];

        assertEqual(mix.length, cacheItem.length);

        mix = mix.map((item, index) => {
          const currentCacheItem = cacheItem[index];
          assertEqual(Number.isNaN(currentCacheItem), false);

          assertEqual(!!cacheItem, true, 'Cache item is undefined');
          assertEqual(!!item, true, 'item is undefined');

          const value = this.ethHashHelper.fnv({
            v1: new BigNumber(item),
            v2: new BigNumber(currentCacheItem),
          });

          const results = value.toNumber();
          assertEqual(Number.isNaN(results), false);

          return results;
        });
      },
    });

    return this.ethHashHelper.sha3_512({
      buffer: converter(mix),
    });
  }
}
