import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { GasComputeResults } from './GasComputer';
import { wordSize } from './wordSize';

@injectable()
export class MemoryExpansionGas {
  private highestReferencedAddress: BigNumber = new BigNumber(0);

  public compute({ address }: MemoryExpansionContext): GasComputeResults {
    if (address.isGreaterThan(this.highestReferencedAddress)) {
      const newWordSize = wordSize({ address });

      const newCost = this.memoryCost({ memoryUsed: newWordSize });
      const oldCost = this.memoryCost({
        memoryUsed: this.highestReferencedAddress,
      });

      // from the docs
      // The memory cost function is linear up to 724 bytes of memory used, at which point additional memory costs substantially more.
      // ^ research this function
      const gasCost = newCost.minus(oldCost).toNumber();
      this.highestReferencedAddress = address;

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

  public get size() {
    return this.highestReferencedAddress;
  }
}

export interface MemoryExpansionContext {
  address: BigNumber;
}
