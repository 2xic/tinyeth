import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { assertEqual } from '../../utils/enforce';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashCache } from './EthHashCache';
import { EthHashDataset } from './EthHashDataset';
import { EthHashHelper } from './EthHashHelpers';
import { Hashimoto } from './Hashimoto';

@injectable()
export class EthHashValidation extends Hashimoto {
  constructor(
    protected ethHashHelper: EthHashHelper,
    private ethHashDataset: EthHashDataset,
    private ethHashBlockParameters: EthHashBlockParameters,
    private ethHashConstants: EthHashCache
  ) {
    super(ethHashHelper);
  }

  public validatePow({
    blockNumber,
    headerHash,
    mixHash,
    nonce,
    difficultly,
  }: {
    blockNumber: BigNumber;
    headerHash: Buffer;
    mixHash: Buffer;
    nonce: Buffer;
    difficultly: BigNumber;
  }) {
    assertEqual(headerHash.length, 32);
    assertEqual(mixHash.length, 32);
    assertEqual(nonce.length, 8);

    const { cacheSize, datasetSize: fullSize } =
      this.ethHashBlockParameters.getBlockParameters({ blockNumber });

    const seed = this.ethHashHelper.getSeedHash({
      blockNumber,
    });

    const cache = this.ethHashConstants.makeCache({
      cacheSize,
      seed,
    });

    const calculatedMixhash = this.hashimoto({
      fullSize,
      nonce,
      header: headerHash,
      cache,
    });

    return calculatedMixhash.equals(mixHash);
  }

  private hashimoto({
    header,
    nonce,
    fullSize,
    cache,
  }: {
    header: Buffer;
    nonce: Buffer;
    fullSize: BigNumber;
    cache: number[][];
  }) {
    return this._hashimoto({
      header,
      nonce,
      fullSize,
      datasetLookup: (i) =>
        this.ethHashDataset.calculateDatasetItem({
          cache,
          i,
        }),
    });
  }
}
