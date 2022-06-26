import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { AccessSets } from './AccessSets';
import { GasComputeResults } from './GasComputer';

@injectable()
export class AccountAccessGas {
  constructor(private accessSets: AccessSets) {}

  public compute({ address }: AccountAccessContext): GasComputeResults {
    const isCold = this.accessSets.isColdAddress({
      address,
    });

    if (isCold) {
      return {
        gasCost: 2600,
        gasRefund: 0,
      };
    } else {
      return {
        gasCost: 100,
        gasRefund: 0,
      };
    }
  }
}

export interface AccountAccessContext {
  address: BigNumber;
}
