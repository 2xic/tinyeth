import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { GasComputeResults } from './GasComputer';

@injectable()
export class MemoryExpansionGas {
  private highestReferencedAddress: BigNumber = new BigNumber(0);

  public compute({ address }: MemoryExpansionContext): GasComputeResults {
    if (address.isGreaterThan(this.highestReferencedAddress)) {
      const newWordSize = address
        .plus(31)
        .dividedBy(32)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR);

      const newCost = this.memoryCost({ memoryUsed: newWordSize });
      const oldCost = this.memoryCost({ memoryUsed: new BigNumber(0) });
      // from the docs
      // The memory cost function is linear up to 724 bytes of memory used, at which point additional memory costs substantially more.
      // ^ research this function
      const gasCost = newCost.minus(oldCost).toNumber();
      return {
        gasCost,
        gasRefund: 0,
      };
    }
    return {
      gasCost: 0,
      gasRefund: 0,
    };
  }

  private memoryCost({ memoryUsed }: { memoryUsed: BigNumber }) {
    return memoryUsed
      .pow(2)
      .dividedBy(512)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      .plus(memoryUsed.multipliedBy(3).decimalPlaces(0, BigNumber.ROUND_FLOOR));
  }
}

export interface MemoryExpansionContext {
  address: BigNumber;
}
