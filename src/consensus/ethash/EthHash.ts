/*

https://ethereum.org/en/developers/docs/consensus-mechanisms/pow/mining-algorithms/ethash/
    https://github.com/ethereum/wiki/wiki/Dagger-Hashimoto

*/

import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { forLoop } from '../../utils/forBigNumberLoop';
import { getBigNumberFromBuffer } from '../../utils/getBigNumberFromBuffer';
import { sha3_256 } from '../../utils/sha3_256';
import {
  ACCESSES,
  HASH_BYTES,
  MIX_BYTES,
  WORD_BYTES,
} from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

export class EthHash {
  constructor(private ethHashHelper: EthHashHelper) {}

  public hashimoto({
    header,
    nonce,
    fullSize,
    datasetLookup,
  }: {
    header: Buffer;
    nonce: Buffer;
    fullSize: BigNumber;
    datasetLookup: (value: BigNumber) => unknown;
  }) {
    const n = fullSize.dividedBy(HASH_BYTES);
    const w = MIX_BYTES.dividedToIntegerBy(WORD_BYTES);
    const mixHashes = MIX_BYTES.dividedBy(HASH_BYTES);

    const s = sha3_256(Buffer.concat([header, nonce.reverse()]));

    let mix: Buffer[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: MIX_BYTES.dividedBy(HASH_BYTES),
      callback: () => {
        mix.push(s);
      },
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: ACCESSES,
      callback: (i) => {
        const p = this.ethHashHelper.fnv({
          v1: new BigNumber(i.toNumber() ^ s[0]),
          v2: new BigNumber(
            mix[i.toNumber() % w.toNumber()].toString('hex'),
            16
          ),
        });
        const newData: unknown[] = [];
        forLoop({
          startValue: new BigNumber(0),
          endValue: new BigNumber(MIX_BYTES.dividedBy(HASH_BYTES)),
          callback: (j) => {
            newData.push(datasetLookup(p.plus(j)));
          },
        });

        mix = mix.map((item, index) => {
          const combined = this.ethHashHelper.fnv({
            v1: new BigNumber(item.toString('hex'), 16),
            // TODO: fix this type
            v2: new BigNumber(newData[index] as any) as BigNumber,
          });

          return getBufferFromHex(combined.toString(16));
        });
      },
    });

    const cmix: BigNumber[] = [];
    forLoop({
      startValue: new BigNumber(0),
      endValue: new BigNumber(mix.length),
      callback: (i) => {
        const mix_i = getBigNumberFromBuffer(mix[i.toNumber()]);
        const mix_i1 = getBigNumberFromBuffer(mix[i.toNumber()]);
        const mix_i2 = getBigNumberFromBuffer(mix[i.toNumber()]);
        const mix_i3 = getBigNumberFromBuffer(mix[i.toNumber()]);

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
