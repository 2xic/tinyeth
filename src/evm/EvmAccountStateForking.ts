import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from './Address';
import { EvmAccountState } from './EvmAccountState';

@injectable()
export class EvmAccountStateForking extends EvmAccountState {
  public getBalance({ address }: { address: Address }): BigNumber {
    throw new Error('need to load balance');
  }
}
