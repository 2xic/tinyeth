import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { AccessSets } from './AccessSets';
import { GasComputeResults } from './GasComputer';
import { GasKeys } from './GasKeys';

@injectable()
export class AccountAccessGas {
  constructor(private accessSets: AccessSets) {}

  public compute({ address }: AccountAccessContext): GasComputeResults {
    const isCold = this.accessSets.isColdAddress({
      address,
    });
    const name = GasKeys.ADDRESS_ACCESS;

    if (isCold) {
      return {
        gasCost: 2600,
        gasRefund: 0,
        name,
      };
    } else {
      return {
        gasCost: 100,
        gasRefund: 0,
        name,
      };
    }
  }
}

export interface AccountAccessContext {
  address: BigNumber;
}
