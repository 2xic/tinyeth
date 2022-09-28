import BigNumber from 'bignumber.js';
import { EvmNumberHandler } from '../../evm/EvmNumberHandler';
import { padHex } from '../../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../../utils/getBufferFromHex';

const FNV_PRIME = new BigNumber('01000193', 16);

export class EthHashHelper {
  public isPrime({ number }: { number: BigNumber }) {
    let i = new BigNumber(2);
    while (i.isLessThan(number.pow(0.5).integerValue())) {
      if (number.modulo(i).isEqualTo(0)) {
        return false;
      }
      i = i.plus(1);
    }
    return true;
  }

  public fnv({ v1, v2 }: { v1: BigNumber; v2: BigNumber }) {
    return new EvmNumberHandler(v1.multipliedBy(FNV_PRIME))
      .xor(new EvmNumberHandler(v2))
      .modulo(new BigNumber(2).pow(32));
  }

  public serialize({ cmix }: { cmix: BigNumber[] }): Buffer {
    return Buffer.concat(
      cmix.map((item) => {
        const results = this.padding({
          value: getBufferFromHex(padHex(item.toString())),
          length: 4,
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
    return Buffer.concat([value, Buffer.alloc(length - value.length)]);
  }
}
