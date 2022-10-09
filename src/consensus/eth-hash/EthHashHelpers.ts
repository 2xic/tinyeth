import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { BigNumberBinaryOperations } from '../../utils/BigNumberBinaryOperations';
import { padHex } from '../../utils/convertNumberToPadHex';
import { assertEqual } from '../../utils/enforce';
import { forLoop } from '../../utils/forBigNumberLoop';
import { getBigNumberFromBuffer } from '../../utils/getBigNumberFromBuffer';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { sha3_256 } from '../../utils/sha3_256';
import { sha3_512 } from '../../utils/sha3_512';
import { EPOCH_LENGTH, WORD_BYTES } from './EthHashConstants';

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

  public getSeedHash({ blockNumber }: { blockNumber: BigNumber }) {
    let seed = Buffer.alloc(32);

    if (!blockNumber.isZero()) {
      forLoop({
        startValue: new BigNumber(0),
        endValue: new BigNumber(blockNumber).dividedToIntegerBy(EPOCH_LENGTH),
        callback: () => {
          const buffer = sha3_256(seed);

          const seralized = this.serialize({
            buffer,
          });
          const reversedList = [...new Array(buffer.length)]
            .map((_, index) => {
              const item = seralized[index];
              return padHex(item.toString(16)).split('').reverse().join('');
            })
            .join('');
          seed = getBufferFromHex(reversedList);
          assertEqual(seed.length, 32);
        },
      });
    }

    return seed;
  }

  public fnv({ v1, v2 }: { v1: BigNumber; v2: BigNumber }) {
    if (v1.isNaN()) {
      throw new Error('v1 is nan');
    } else if (v2.isNaN()) {
      throw new Error('v2 is nan');
    }

    return new BigNumberBinaryOperations(v1.times(FNV_PRIME))
      .xor(new BigNumberBinaryOperations(v2))
      .modulo(new BigNumber(2).pow(32));
  }

  public serialize({
    buffer,
  }: {
    buffer: BigNumber[] | number[] | Buffer;
  }): Buffer {
    if (Buffer.isBuffer(buffer)) {
      return buffer;
    }
    const results = Buffer.concat(
      [...new Array(buffer.length)].map((_, index) => {
        const item = buffer[index];
        const slicedBuffer = padHex(item.toString(16))
          .split('')
          .reverse()
          .join('');

        const value = getBufferFromHex(slicedBuffer);

        const results = this.padding({
          value,
          length: 2,
        });

        return results;
      })
    );

    return results;
  }

  public sha3_256({ buffer }: { buffer: Buffer }) {
    const hashed = sha3_256(buffer);

    return this.deserialize({ hashed });
  }

  public sha3_512({ buffer }: { buffer: Buffer }) {
    const hashed = sha3_512(buffer);

    return this.deserialize({ hashed });
  }

  public deserialize({ hashed }: { hashed: Buffer }): Array<number> {
    return [...new Array(hashed.length / WORD_BYTES.toNumber())].map(
      (_, index) => {
        const item = hashed.slice(
          index * WORD_BYTES.toNumber(),
          (index + 1) * WORD_BYTES.toNumber()
        );

        return this.decodeInt({
          buffer: item,
        });
      }
    );
  }

  public decodeInt({ buffer }: { buffer: Buffer }): number {
    const reverseBuffer = [...buffer].reverse();

    return getBigNumberFromBuffer(Buffer.from(reverseBuffer)).toNumber();
  }

  private padding({
    value,
    length,
  }: {
    value: Buffer;
    length: number;
  }): Buffer {
    const bufferLength = value.length;
    return Buffer.concat([
      value,
      Buffer.alloc(Math.max(0, length - bufferLength)),
    ]);
  }
}
