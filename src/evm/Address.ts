import BigNumber from 'bignumber.js';
import crypto from 'crypto';

export class Address {
  private address: BigNumber;

  constructor(bytes: string = crypto.randomBytes(32).toString('hex')) {
    this.address = new BigNumber(bytes.toLocaleLowerCase(), 16);
  }

  public toString() {
    return `0x${this.address.toString(16)}`;
  }

  public get raw() {
    return this.address;
  }
}
