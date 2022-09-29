import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { sha3_512 } from 'js-sha3';
import { getBufferFromHex } from '../../utils';
import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
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
    cache: Buffer[];
  }): Buffer[] {
    const size = fullSize.dividedToIntegerBy(HASH_BYTES);

    const items =
      // TODO, is this even correct ? I think size should be positive always
      0 < size.toNumber()
        ? [...new Array(size.toNumber())].map((_, index) =>
            this.calculateDatasetItem({
              cache,
              i: new BigNumber(index),
            })
          )
        : [];

    const results = items.map((item) => getBufferFromHex(item));
    const hasUndefined = results.find((item) => item === undefined);
    if (hasUndefined) {
      throw new Error('undefined data item');
    }

    return results;
  }

  public calculateDatasetItem({ cache, i }: { cache: Buffer[]; i: BigNumber }) {
    const size = cache.length;
    const r = HASH_BYTES.dividedToIntegerBy(WORD_BYTES);

    let mix = cache[i.modulo(size).toNumber()];
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
