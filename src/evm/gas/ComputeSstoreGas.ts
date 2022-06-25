import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { AccessSets } from '../AccessSets';
import { OutOfGasError } from '../errors/OutOfGasError';
import { EvmKeyValueStorage } from '../EvmKeyValueStorage';

@injectable()
export class ComputeSstoreGas {
  constructor(
    private accessSets: AccessSets,
    private storage: EvmKeyValueStorage
  ) {}

  // implementation of https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a7-sstore
  public compute({ gasLeft, address, key, value }: SstoreContext): Results {
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

    if (this.storage.read({ key }).isEqualTo(value)) {
      gasCost += 100;
    } else {
      if (this.storage.isEqualOriginal({ key })) {
        if (this.storage.isOriginallyZero({ key })) {
          gasCost += 20000;
        } else {
          gasCost += 2900;
          if (value.isEqualTo(0)) {
            gasRefund += 4800;
          }
        }
      } else {
        gasCost += 100;
        if (!this.storage.isOriginallyZero({ key })) {
          if (this.storage.read({ key }).isEqualTo(0)) {
            gasRefund -= 4800;
          } else if (value.isEqualTo(0)) {
            gasRefund += 4800;
          } else if (this.storage.isEqualOriginal({ key })) {
            if (this.storage.isOriginallyZero({ key })) {
              gasRefund += 19900;
            } else {
              gasRefund += 2800;
            }
          }
        }
      }
    }

    return { gasCost, gasRefund };
  }
}

export interface SstoreContext {
  gasLeft: number;
  address: string;
  key: BigNumber;
  value: BigNumber;
}

export interface Results {
  gasCost: number;
  gasRefund: number;
}
