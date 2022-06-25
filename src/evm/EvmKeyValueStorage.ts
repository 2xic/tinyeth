/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';

@injectable()
export class EvmKeyValueStorage {
  public storage: Record<string, BigNumber> = {};

  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    this.storage[key.toString(16)] = value;
  }

  public read({ key }: { key: BigNumber | number }): BigNumber {
    return this.storage[key.toString(16)] || new BigNumber(0);
  }

  public isEqualOriginal({ key }: { key: BigNumber }) {
    // TODO: Fully implement this.
    // it should basically do copy of the memory before execution and check against it.
    return true;
  }

  public isOriginallyZero({ key }: { key: BigNumber }) {
    // Should check the original storage.
    return this.read({ key }).isEqualTo(0);
  }
}
