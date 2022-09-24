import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from '../Address';
import { Wei } from '../eth-units/Wei';
import { AccountAccessGas } from './AccountAccessGas';
import { GasComputeResults } from './GasComputer';
import { GasKeys } from './GasKeys';
import { MemoryExpansionGas } from './MemoryExpansionGas';

@injectable()
export class BaseGasComputer {
  constructor(
    private accountAccessGas: AccountAccessGas,
    private memoryExpansionGas: MemoryExpansionGas
  ) {}

  public compute(options: BaseGasOptions): GasComputeResults {
    // https://github.com/wolflo/evm-opcodes/blob/main/gas.md#aa-1-call
    const addressCost = this.accountAccessGas.compute({
      address: options.address.raw,
    });
    if (!options.value.value.isZero()) {
      throw new Error('Supported is not added yet');
    }

    const memoryExpansionGas = this.memoryExpansionGas.compute({
      address: options.memoryOffsets.argsOffset.plus(
        options.memoryOffsets.argsSize
      ),
    });

    return {
      gasCost: addressCost.gasCost + memoryExpansionGas.gasCost,
      gasRefund: addressCost.gasRefund + memoryExpansionGas.gasRefund,
      name: GasKeys.BASE_GAS,
    };
  }
}

export interface BaseGasOptions {
  address: Address;
  value: Wei;
  memoryOffsets: {
    argsOffset: BigNumber;
    argsSize: BigNumber;
  };
}
