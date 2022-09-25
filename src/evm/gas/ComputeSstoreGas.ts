import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { AccessSets } from './AccessSets';
import { OutOfGasError } from '../errors/OutOfGasError';
import { EvmStorage } from '../EvmStorage';
import { GasComputeResults } from './GasComputer';
import { Address } from '../Address';
import { GasKeys } from './GasKeys';

@injectable()
export class ComputeSstoreGas {
  constructor(private accessSets: AccessSets, private storage: EvmStorage) {}

  public computeSload(context: SloadContext): GasComputeResults {
    const isCold = this.accessSets.isColdSlot({
      address: context.address,
      key: context.key,
    });
    if (isCold) {
      return {
        gasCost: 2100,
        gasRefund: 0,
        name: GasKeys.STORAGE_READ,
      };
    } else {
      return {
        gasCost: 100,
        gasRefund: 0,
        name: GasKeys.STORAGE_READ,
      };
    }
  }

  // implementation of https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a7-sstore
  public computeStore({
    gasLeft,
    address,
    key,
    value,
  }: SstoreContext): GasComputeResults {
    if (gasLeft < 2300) {
      throw new OutOfGasError();
    }
    let gasCost = 0;
    let gasRefund = 0;

    if (
      this.accessSets.isColdSlot({
        address,
        key,
      })
    ) {
      gasCost += 2100;
    }

    const currentValue = this.storage.readSync({
      key,
      address: new Address(address),
    });
    const isNoOp = currentValue.isEqualTo(value);

    if (isNoOp) {
      gasCost += 100;
    } else {
      const isEqualOriginal = this.storage.isEqualOriginal({
        key,
        address: new Address(address),
      });
      const isOriginallyZero = this.storage.isOriginallyZero({
        key,
        address: new Address(address),
      });

      if (isEqualOriginal) {
        if (isOriginallyZero) {
          gasCost += 20000;
        } else {
          gasCost += 2900;

          if (value.isEqualTo(0)) {
            gasRefund += 4800;
          }
        }
      } else {
        gasCost += 100;

        const originalValue = this.storage.readOriginalValue({
          key,
          address: new Address(address),
        });
        const isNotOriginallyZero = !originalValue.isZero();

        if (isNotOriginallyZero) {
          if (currentValue.isEqualTo(0)) {
            gasRefund -= 4800;
          } else if (value.isEqualTo(0)) {
            gasRefund += 4800;
          }
        }

        if (originalValue.isEqualTo(value)) {
          if (
            this.storage.isOriginallyZero({
              key,
              address: new Address(address),
            })
          ) {
            gasRefund += 19900;
          } else {
            gasRefund += 2800;
          }
        }
      }
    }

    this.accessSets.touchStorageSlot({
      address,
      key,
    });

    return { gasCost, gasRefund, name: GasKeys.STORAGE_WRITE };
  }
}

export interface SloadContext {
  address: string;
  key: BigNumber;
}

export interface SstoreContext extends SloadContext {
  gasLeft: number;
  value: BigNumber;
}
