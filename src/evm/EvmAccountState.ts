import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from './Address';

@injectable()
export class EvmAccountState {
  private balance: Record<string, BigNumber | undefined> = {};

  public registerBalance({
    address,
    balance,
  }: {
    address: Address;
    balance: BigNumber;
  }) {
    this.balance[address.toString()] = balance;
  }

  public getBalance({ address }: { address: Address }): BigNumber {
    return this.balance[address.toString()] || new BigNumber(0);
  }
}
