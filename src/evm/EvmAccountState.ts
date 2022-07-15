import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from './Address';

@injectable()
export class EvmAccountState {
  private balance: Record<string, BigNumber> = {};

  public registerBalance({
    address,
    balance,
  }: {
    address: Address;
    balance: BigNumber;
  }) {
    this.balance[address.toString()] = balance;
  }

  public getBalance({ address }: { address: Address }) {
    return this.balance[address.toString()];
  }
}
