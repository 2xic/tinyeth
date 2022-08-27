import BigNumber from 'bignumber.js';
import { EvmStorage } from './EvmStorage';

export class EvmStorageForking extends EvmStorage {
  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    return super.write({ key, value });
  }

  public read({ key }: { key: BigNumber | number }): BigNumber {
    throw new Error(`Need to load ${key}`);
  }
}
