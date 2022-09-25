import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { EvmAccountState } from './EvmAccountState';

@injectable()
export class EvmAccountStateForking extends EvmAccountState {
  public getBalance(): BigNumber {
    throw new Error('need to load balance');
  }
}
