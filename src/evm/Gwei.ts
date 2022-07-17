import BigNumber from 'bignumber.js';
import { Ether } from './Ether';

export class GWei {
  constructor(public value: BigNumber) {}

  public toEther() {
    return new Ether(
      new BigNumber(this.value).dividedBy(new BigNumber(10).pow(9))
    );
  }

  public toString() {
    return this.value.toString();
  }
}
