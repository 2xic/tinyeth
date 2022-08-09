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
    return this.computeSstoreGas.compute(context);
  }

  public memoryExpansion(context: MemoryExpansionContext): GasComputeResults {
    return this.memoryExpansionGas.compute(context);
  }

  public account(context: AccountAccessContext) {
    return this.accountAccess.compute(context);
  }

  public call(context: CallContext) {
    return this.callGasCompute.compute(context);
  }
}

export interface GasComputeResults {
  gasCost: number;
  gasRefund: number;
}
