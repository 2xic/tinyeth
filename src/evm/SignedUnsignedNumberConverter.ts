import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../utils/getBufferFromHex';

// TODO: see if there is away around this.
BigNumber.set({ EXPONENTIAL_AT: 10_024 });

export class SignedUnsignedNumberConverter {
  public parse(rawInput: string | BigNumber): BigNumber {
    const input = BigNumber.isBigNumber(rawInput)
      ? rawInput.toString(16)
      : rawInput;
    const is32Bit = input.length === 64;
    const numberBuff = getBufferFromHex(input);
    const bigNum = new BigNumber(input.toLocaleLowerCase(), 16);
    const binary = numberBuff[0].toString(2);
    const isNegative = is32Bit && binary[0] === '1';
    if (isNegative) {
      const flipped = this.flip(bigNum);
      return new BigNumber(flipped.toString()).negated();
    }
    return bigNum;
  }

  public convert(value: BigNumber): BigNumber {
    if (value.isLessThan(0)) {
      return new BigNumber(this.flip(value).toString()).negated();
    }
    return value;
  }

  private flip(value: BigNumber) {
    const a = BigInt(value.toString());
    const b = BigInt(new BigNumber(2).pow(256).minus(1).toString());
    const flipped = (a ^ b) + BigInt(1);
    return flipped;
  }
}
