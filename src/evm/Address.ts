import BigNumber from 'bignumber.js';
import crypto from 'crypto';
import { getBufferFromHex } from '../utils/getBufferFromHex';

export class Address {
  private address: BigNumber;

  constructor(
    address: BigNumber | string = crypto.randomBytes(32).toString('hex')
  ) {
    if (BigNumber.isBigNumber(address)) {
      this.address = address;
    } else {
      this.address = new BigNumber(
        getBufferFromHex(address.toLocaleLowerCase()).toString('hex'),
        16
      );
    }
  }

  public toString() {
    return `0x${this.address.toString(16)}`;
  }

  public get raw() {
    return this.address;
  }
}
