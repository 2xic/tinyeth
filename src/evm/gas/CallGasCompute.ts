import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from '../Address';
import { EvmAccountState } from '../EvmAccountState';
import { AccountAccessGas } from './AccountAccessGas';
import { GasComputeResults } from './GasComputer';
import { GasKeys } from './GasKeys';

@injectable()
export class CallGasCompute {
  constructor(
    private accountAccess: AccountAccessGas,
    private accountState: EvmAccountState
  ) {}

  public compute(context: CallContext): GasComputeResults {
    let gasRefund = 0;
    let gasCost = 0;

    const addressAccess = this.accountAccess.compute({
      address: context.address.raw,
    });

    const isZeroAddress = this.accountState.getBalance({
      address: context.address,
    });

    const valueCost = !context.value.isZero() ? 9000 : 0;
    const costOfTransfer = isZeroAddress.isEqualTo(0) ? 25_000 : 0;

    gasRefund += addressAccess.gasRefund + valueCost + costOfTransfer;
    gasCost += addressAccess.gasCost + valueCost + costOfTransfer;

    return {
      gasCost,
      gasRefund,
      name: GasKeys.CALL,
    };
  }
}

export interface CallContext {
  address: Address;
  value: BigNumber;
}
