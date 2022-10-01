import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
import {
  ACCESSES,
  EPOCH_LENGTH,
  HASH_BYTES,
  MIX_BYTES,
  WORD_BYTES,
} from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';
import { injectable } from 'inversify';
import { EthHashDataset } from './EthHashDataset';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashConstants } from './EthHashCache';
import { Hashimoto } from './Hashimoto';

@injectable()
export class EthHash extends Hashimoto {
  constructor(
    protected ethHashHelper: EthHashHelper,
    private ethHashDataset: EthHashDataset,
    private ethHashBlockParameters: EthHashBlockParameters,
    private ethHashConstants: EthHashConstants
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
    const dataset = this.ethHashDataset.calculateDataset({
      fullSize,
      cache,
    });

    // TODO: should not stop mining before the difficulty is hit

    return this.hashimoto({
      cache,
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
        dataset[i.toNumber()] ||
        // TODO: THs is not correct.
        getBufferFromHex(
          this.ethHashDataset.calculateDatasetItem({
            cache,
            i,
          })
        ),
    });
  }
}
