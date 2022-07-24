import { injectable } from 'inversify';
import { AccountAccessContext, AccountAccessGas } from './AccountAccessGas';
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
    private accountAccess: AccountAccessGas
  ) {}

  public sstore(context: SstoreContext): GasComputeResults {
    return this.computeSstoreGas.compute(context);
  }

  public memoryExpansion(context: MemoryExpansionContext): GasComputeResults {
    return this.memoryExpansionGas.compute(context);
  }

  public account(context: AccountAccessContext) {
    return this.accountAccess.compute(context);
  }
}

export interface GasComputeResults {
  gasCost: number;
  gasRefund: number;
}
