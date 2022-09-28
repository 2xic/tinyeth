import BigNumber from 'bignumber.js';
import {
  CACHE_BYTES_GROWTH,
  CACHE_BYTES_INIT,
  DATASET_BYTES_GROWTH,
  DATASET_BYTES_INIT,
  EPOCH_LENGTH,
  HASH_BYTES,
  MIX_BYTES,
} from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

export class EthHashBlockParameters {
  constructor(private ethHashHelper: EthHashHelper) {}

  public getBlockParameters({ blockNumber }: { blockNumber: BigNumber }) {
    const cacheSize = this.getSize({
      initSize: CACHE_BYTES_INIT,
      bytesGrowth: CACHE_BYTES_GROWTH,
      blockNumber,
      normalizeParameter: HASH_BYTES,
    });
    const datasetSize = this.getSize({
      initSize: DATASET_BYTES_INIT,
      bytesGrowth: DATASET_BYTES_GROWTH,
      blockNumber,
      normalizeParameter: MIX_BYTES,
    });

    return {
      cacheSize,
      datasetSize,
    };
  }

  private getSize({
    initSize,
    blockNumber,
    bytesGrowth,
    normalizeParameter,
  }: {
    blockNumber: BigNumber;
    initSize: BigNumber;
    bytesGrowth: BigNumber;
    normalizeParameter: BigNumber;
  }) {
    let sz = initSize
      .plus(bytesGrowth)
      .multipliedBy(blockNumber.dividedToIntegerBy(EPOCH_LENGTH));
    sz = sz.minus(normalizeParameter);

    while (
      !this.ethHashHelper.isPrime({
        number: sz.dividedBy(MIX_BYTES),
      })
    ) {
      sz = sz.minus(MIX_BYTES.multipliedBy(2));
    }
    return sz;
  }
}
