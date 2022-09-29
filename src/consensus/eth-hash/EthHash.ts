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

@injectable()
export class EthHash {
  constructor(
    private ethHashHelper: EthHashHelper,
    private ethHashDataset: EthHashDataset,
    private ethHashBlockParameters: EthHashBlockParameters,
    private ethHashConstants: EthHashConstants
  ) {}

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

    let seed = Buffer.alloc(32);
    forLoop({
      startValue: new BigNumber(0),
      endValue: new BigNumber(blockNumber).dividedToIntegerBy(EPOCH_LENGTH),
      callback: () => {
        seed = this.ethHashHelper.serialize({
          cmix: sha3_256(seed),
        });
      },
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
        getBufferFromHex(
          this.ethHashDataset.calculateDatasetItem({
            cache,
            i,
          })
        ),
    });
  }

  private _hashimoto({
    header,
    nonce,
    fullSize,
    datasetLookup,
  }: {
    header: Buffer;
    nonce: Buffer;
    fullSize: BigNumber;
    datasetLookup: (value: BigNumber) => Buffer;
  }) {
    const n = fullSize.dividedBy(HASH_BYTES);
    const w = MIX_BYTES.dividedToIntegerBy(WORD_BYTES);
    const mixHashes = MIX_BYTES.dividedBy(HASH_BYTES);

    const s = sha3_256(Buffer.concat([header, nonce.reverse()]));

    let mix: number[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: MIX_BYTES.dividedToIntegerBy(HASH_BYTES),
      callback: () => {
        mix.push(...s);
      },
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: ACCESSES,
      callback: (i) => {
        const mixResults = mix[i.toNumber() % w.toNumber()];
        if (!mixResults) {
          throw new Error(
            `Found no mix match ${mix.length} vs ${i.toNumber() % w.toNumber()}`
          );
        }
        const p = this.ethHashHelper.fnv({
          v1: new BigNumber(i.toNumber() ^ s[0]),
          v2: new BigNumber(mixResults)
            .modulo(n.dividedToIntegerBy(mixHashes))
            .times(mixHashes),
        });
        const newData: number[] = [];
        forLoop({
          startValue: new BigNumber(0),
          endValue: MIX_BYTES.dividedBy(HASH_BYTES),
          callback: (j) => {
            newData.push(...datasetLookup(p.plus(j)));
          },
        });

        mix = mix.map((item, index) => {
          const combined = this.ethHashHelper.fnv({
            v1: new BigNumber(item),
            v2: new BigNumber(newData[index]),
          });

          return combined.toNumber();
        });
      },
    });

    const cmix: BigNumber[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: new BigNumber(mix.length),
      callback: (i) => {
        const mix_i = new BigNumber(mix[i.toNumber()]);
        const mix_i1 = new BigNumber(mix[i.toNumber()]);
        const mix_i2 = new BigNumber(mix[i.toNumber()]);
        const mix_i3 = new BigNumber(mix[i.toNumber()]);

        const results = this.ethHashHelper.fnv({
          v1: this.ethHashHelper.fnv({
            v1: this.ethHashHelper.fnv({
              v1: mix_i,
              v2: mix_i1,
            }),
            v2: mix_i2,
          }),
          v2: mix_i3,
        });

        cmix.push(results);
      },
    });

    return this.ethHashHelper.serialize({
      cmix,
    });
  }
}
