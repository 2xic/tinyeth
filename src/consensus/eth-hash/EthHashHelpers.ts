import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { BigNumberBinaryOperations } from '../../utils/BigNumberBinaryOperations';
import { padHex } from '../../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../../utils/getBufferFromHex';

const FNV_PRIME = new BigNumber('01000193', 16);

@injectable()
export class EthHashHelper {
  public isPrime({ number }: { number: BigNumber }) {
    let i = new BigNumber(2);
    while (i.isLessThan(new BigNumber(number).squareRoot().integerValue())) {
      if (number.modulo(i).isEqualTo(0)) {
        return false;
      }
      i = i.plus(1);
    }
    return true;
  }

  public fnv({ v1, v2 }: { v1: BigNumber; v2: BigNumber }) {
    return new BigNumberBinaryOperations(v1.multipliedBy(FNV_PRIME))
      .xor(new BigNumberBinaryOperations(v2))
      .modulo(new BigNumber(2).pow(32));
  }

  public serialize({ cmix }: { cmix: BigNumber[] | Buffer }): Buffer {
    return Buffer.concat(
      [...cmix].map((item) => {
        const results = this.padding({
          value: getBufferFromHex(
            padHex(item.toString(16)).split('').reverse().join('')
          ),
          // Not sure why 4 is selected the padding.
          // since it's always 2d when it's used as a hex (because \0 is end of string char)
          length: 1,
        });

        return results;
      })
    );
  }

  private padding({
    value,
    length,
  }: {
    value: Buffer;
    length: number;
  }): Buffer {
    return Buffer.concat([
      value,
      Buffer.alloc(Math.max(0, length - value.length)),
    ]);
  }
}
