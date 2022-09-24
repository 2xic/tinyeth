import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from '../Address';
import { EvmDebugger } from '../EvmDebugger';
import { AccessSets } from './AccessSets';
import { AccountAccessContext, AccountAccessGas } from './AccountAccessGas';
import { BaseGasComputer, BaseGasOptions } from './BaseGasComputer';
import { CallContext, CallGasCompute } from './CallGasCompute';
import {
  ComputeSstoreGas,
  SloadContext,
  SstoreContext,
} from './ComputeSstoreGas';
import { GasKeys } from './GasKeys';
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
    private accessSets: AccessSets,
    private evmDebugger: EvmDebugger,
    private baseGasComputer: BaseGasComputer
  ) {}

  public warmAddress({ address }: { address: Address }) {
    this.accessSets.touchAddress({ address: address.raw });
  }

  public warmKey({ address, key }: { address: string; key: BigNumber }) {
    this.accessSets.touchStorageSlot({
      address,
      key,
    });
  }

  public sstore(context: SstoreContext): GasComputeResults {
    return this.validateGasResults(this.computeSstoreGas.computeStore(context));
  }

  public sload(context: SloadContext): GasComputeResults {
    return this.validateGasResults(this.computeSstoreGas.computeSload(context));
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

  public baseGas(context: BaseGasOptions) {
    return this.validateGasResults(this.baseGasComputer.compute(context));
  }

  private validateGasResults(options: GasComputeResults) {
    if (options.gasCost < 0) {
      throw new Error('Gas cost is negative.');
    }
    this.evmDebugger.writeGasUsage({
      key: options.name,
      value: options.gasCost,
    });
    return options;
  }
}

export interface GasComputeResults {
  gasCost: number;
  gasRefund: number;
  name: GasKeys;
}
