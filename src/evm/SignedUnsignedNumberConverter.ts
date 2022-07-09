// TODO: see if there is away around this.
BigNumber.set({ EXPONENTIAL_AT: 1024 });

import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../utils/getBufferFromHex';

export class SignedUnsignedNumberConverter {
  public parse(input: string): BigNumber {
    const numberBuff = getBufferFromHex(input);
    const bigNum = new BigNumber(input.toLocaleLowerCase(), 16);
    const binary = numberBuff[0].toString(2);
    const isNegative = binary[0] === '1';
    if (isNegative) {
      const a = BigInt(bigNum.toString());
      const b = BigInt(new BigNumber(2).pow(256).minus(1).toString());
      const flipped = (a ^ b) + BigInt(1);
      return new BigNumber(flipped.toString()).negated();
    }
    return bigNum;
  }
}
