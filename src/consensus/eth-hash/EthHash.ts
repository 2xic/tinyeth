import BigNumber from 'bignumber.js';
import { EthHashHelper } from './EthHashHelpers';
import { injectable } from 'inversify';
import { EthHashDataset } from './EthHashDataset';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashCache } from './EthHashCache';
import { Hashimoto } from './Hashimoto';

@injectable()
export class EthHash extends Hashimoto {
  constructor(
    protected ethHashHelper: EthHashHelper,
    private ethHashDataset: EthHashDataset,
    private ethHashBlockParameters: EthHashBlockParameters,
    private ethHashConstants: EthHashCache
  ) {
    super(ethHashHelper);
  }

  public mine({
    blockNumber,
    header,
    difficultly,
  }: {
    blockNumber: BigNumber;
    header: Buffer;
    difficultly: BigNumber;
  }) {
    const { cacheSize, datasetSize: fullSize } =
      this.ethHashBlockParameters.getBlockParameters({ blockNumber });
    const nonce = BigNumber.random()
      .times(new BigNumber(2).pow(64))
      .integerValue();

    const seed = this.ethHashHelper.getSeedHash({
      blockNumber,
    });

    const cache = this.ethHashConstants.makeCache({
      cacheSize,
      seed,
    });
    const cacheBuffer = cache.map((item) => Buffer.from(item));

    const dataset = this.ethHashDataset.calculateDataset({
      fullSize,
      cache: cacheBuffer,
    });

    // TODO: should not stop mining before the difficulty is hit

    return this.hashimoto({
      cache: cacheBuffer,
      header,
      nonce,
      dataset,
      fullSize,
    });
  }

  private hashimoto({
    header,
    nonce,
    fullSize,
    dataset,
    cache,
  }: {
    header: Buffer;
    nonce: BigNumber;
    fullSize: BigNumber;
    dataset: Buffer[];
    cache: Buffer[];
  }) {
    return this._hashimoto({
      header,
      nonce: Buffer.from(nonce.toString(16), 'hex'),
      fullSize,
      datasetLookup: (i) =>
        //   dataset[i.toNumber()] ||
        // TODO: THs is not correct.
        this.ethHashDataset.calculateDatasetItem({
          cache,
          i,
        }),
    });
  }
}
