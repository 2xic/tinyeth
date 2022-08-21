import { injectable } from 'inversify';
import { AccessSets } from './AccessSets';
import { AccountAccessContext, AccountAccessGas } from './AccountAccessGas';
import { CallContext, CallGasCompute } from './CallGasCompute';
import { ComputeSstoreGas, SstoreContext } from './ComputeSstoreGas';
import {
  MemoryExpansionContext,
  MemoryExpansionGas,
} from './MemoryExpansionGas';

@injectable()
export class GasComputer {
  constructor(
    private computeSstoreGas: ComputeSstoreGas,
    private memoryExpansionGas: MemoryExpansionGas,
    private accountAccess: AccountAccessGas,
    private callGasCompute: CallGasCompute,
    private accessSets: AccessSets
  ) {}

  public warmAddress({ address }: { address: any }) {
    this.accessSets.touchAddress({ address });
  }

  public sstore(context: SstoreContext): GasComputeResults {
    return this.validateGasResults(this.computeSstoreGas.compute(context));
  }

  public memoryExpansion(context: MemoryExpansionContext): GasComputeResults {
    return this.validateGasResults(this.memoryExpansionGas.compute(context));
  }

  public account(context: AccountAccessContext) {
    return this.validateGasResults(this.accountAccess.compute(context));
  }

  public call(context: CallContext) {
    return this.validateGasResults(this.callGasCompute.compute(context));
  }

  private validateGasResults(options: GasComputeResults) {
    if (options.gasCost < 0) {
      throw new Error('Gas cost is negative.');
    }
    return options;
  }
}

export interface GasComputeResults {
  gasCost: number;
  gasRefund: number;
}
