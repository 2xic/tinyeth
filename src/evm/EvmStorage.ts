import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';

@injectable()
export class EvmStorage {
  public memory!: Buffer;
  public storage: Record<string, BigNumber> = {};

  constructor() {
    this.memory = Buffer.alloc(2048, 0);
  }

  public isEqualOriginal(arg0: { key: BigNumber }) {
    // TODO: Fully implement this.
    // it should basically do copy of the memory before execution and check against it.
    return true;
  }

  public isOriginallyZero({ key }: { key: BigNumber }) {
    // Should check the original storage.
    return (this.storage[key.toString(16)] || new BigNumber(0)).isEqualTo(0);
  }

  public get({ key }: { key: BigNumber }) {
    return this.storage[key.toString(16)] || new BigNumber(0);
  }
}
