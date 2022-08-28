/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';

@injectable()
export class EvmStorage {
  public storage: Record<string, BigNumber> = {};

  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    this.storage[key.toString(16)] = value;
  }

  public async read({ key }: { key: BigNumber | number }): Promise<BigNumber> {
    return this.readSync({ key });
  }

  public hasKey({ key }: { key: BigNumber | number }) {
    return key.toString(16) in this.storage;
  }

  public readSync({ key }: { key: BigNumber | number }): BigNumber {
    return this.storage[key.toString(16)] || new BigNumber(0);
  }

  public isEqualOriginal({ key }: { key: BigNumber }) {
    // TODO: Fully implement this.
    // it should basically do copy of the memory before execution and check against it.
    return true;
  }

  public isOriginallyZero({ key }: { key: BigNumber }) {
    // Should check the original storage.
    return this.readSync({ key }).isEqualTo(0);
  }

  public forEach(callback: (key: BigNumber, value: BigNumber) => void) {
    return Object.entries(this.storage).map((item) => {
      callback(new BigNumber(item[0]), item[1]);
    });
  }
}
