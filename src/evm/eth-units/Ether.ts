import BigNumber from 'bignumber.js';
import { Wei } from './Wei';

export class Ether {
  constructor(public value: BigNumber) {}

  public toWei() {
    return new Wei(
      new BigNumber(this.value).multipliedBy(new BigNumber(10).pow(18))
    );
  }
}
