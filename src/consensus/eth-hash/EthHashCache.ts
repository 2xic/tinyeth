import BigNumber from 'bignumber.js';
import { sha3_512 } from 'js-sha3';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
import { CACHE_ROUNDS } from './EthHashConstants';
import { injectable } from 'inversify';
import { getBigNumberFromBuffer } from '../../utils/getBigNumberFromBuffer';

@injectable()
export class EthHashConstants {
  public makeCache({
    cacheSize,
    seed,
  }: {
    cacheSize: BigNumber;
    seed: Buffer;
  }): Buffer[] {
    const seedBigNumber = getBigNumberFromBuffer(seed);
    const n = cacheSize.dividedToIntegerBy(seedBigNumber);
    const set = [sha3_256(seed)];

    forLoop({
      startValue: new BigNumber(1),
      endValue: n,
      callback: () => set.push(sha3_256(set[set.length - 1])),
    });

    forLoop({
      startValue: new BigNumber(0),
      endValue: CACHE_ROUNDS,
      callback: () => {
        forLoop({
          startValue: new BigNumber(0),
          endValue: n,
          callback: (i) => {
            const v = set[i.toNumber()][0] % n.toNumber();
            const mappedHash = sha3_512(
              set[i.toNumber()].map((item) => {
                return item ^ v;
              })
            );
            set[i.toNumber()] = getBufferFromHex(mappedHash);
          },
        });
      },
    });

    return set;
  }
}
