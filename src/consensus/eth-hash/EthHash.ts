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
    nonce: inputNonce,
    blockNumber,
    header,
    difficultly,
  }: {
    nonce?: Buffer;
    blockNumber: BigNumber;
    header: Buffer;
    difficultly: BigNumber;
  }) {
    const { cacheSize, datasetSize: fullSize } =
      this.ethHashBlockParameters.getBlockParameters({ blockNumber });
    const nonce = inputNonce
      ? inputNonce
      : Buffer.from(
          BigNumber.random()
            .times(new BigNumber(2).pow(64))
            .integerValue()
            .toString(16),
          'hex'
        );

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
  }: {
    header: Buffer;
    nonce: Buffer;
    fullSize: BigNumber;
    dataset: number[][];
    cache: number[][];
  }) {
    return this._hashimoto({
      header,
      nonce, //: Buffer.from(nonce.toString(16), 'hex'),
      fullSize,
      datasetLookup: (i) => dataset[i.toNumber()],
    });
  }
}
