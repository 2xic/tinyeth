import BigNumber from 'bignumber.js';
import { sha3_512 } from 'js-sha3';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { forLoop } from '../../utils/forBigNumberLoop';
import { sha3_256 } from '../../utils/sha3_256';
import { CACHE_ROUNDS } from './EthHashConstants';

export class EthHashConstants {
  public makeCache({
    cacheSize,
    seed,
  }: {
    cacheSize: BigNumber;
    seed: BigNumber;
  }) {
    const n = cacheSize.dividedToIntegerBy(seed);
    const set = [sha3_256(getBufferFromHex(seed.toString(16)))];

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
