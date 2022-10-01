import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashConstants } from './EthHashCache';
import { EthHashDataset } from './EthHashDataset';
import { EthHashHelper } from './EthHashHelpers';
import { Hashimoto } from './Hashimoto';

export class EthHashValidation extends Hashimoto {
  constructor(
    protected ethHashHelper: EthHashHelper,
    private ethHashDataset: EthHashDataset,
    private ethHashBlockParameters: EthHashBlockParameters,
    private ethHashConstants: EthHashConstants
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
    cache: Buffer[];
  }) {
    return this._hashimoto({
      header,
      nonce,
      fullSize,
      datasetLookup: (i) =>
        getBufferFromHex(
          this.ethHashDataset.calculateDatasetItem({
            cache,
            i,
          })
        ),
    });
  }
}
