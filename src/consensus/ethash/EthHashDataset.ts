import BigNumber from 'bignumber.js';
import { sha3_512 } from 'js-sha3';
import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
import { DATASET_PARENTS, HASH_BYTES, WORD_BYTES } from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

export class EthHashDataset {
  constructor(private ethHashHelper: EthHashHelper) {}

  public calculateDataset({
    fullSize,
    cache,
  }: {
    fullSize: BigNumber;
    cache: Buffer[];
  }) {
    const size = fullSize.dividedToIntegerBy(HASH_BYTES);
    return [...new Array(size.toNumber())].map((item) =>
      this.calculateDatasetItem({
        cache,
        i: new BigNumber(item),
      })
    );
  }

  private calculateDatasetItem({
    cache,
    i,
  }: {
    cache: Buffer[];
    i: BigNumber;
  }) {
    const size = cache.length;
    const r = HASH_BYTES.dividedToIntegerBy(WORD_BYTES);

    let mix = cache[i.modulo(r).toNumber()];
    mix[0] ^= i.toNumber();
    mix = sha3_256(mix);

    forLoop({
      startValue: new BigNumber(0),
      endValue: DATASET_PARENTS,
      callback: (j) => {
        const cacheIndex = this.ethHashHelper.fnv({
          v1: i.pow(j),
          v2: new BigNumber(mix[j.modulo(r).toNumber()]),
        });
        mix = Buffer.from(
          mix.map((item) => {
            const value = this.ethHashHelper.fnv({
              v1: new BigNumber(item),
              v2: new BigNumber(
                cache[cacheIndex.modulo(size).toNumber()].toString('hex'),
                16
              ),
            });
            return value.toNumber();
          })
        );
      },
    });

    return sha3_512(mix);
  }
}
