/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { padHex } from '../utils/';
import { padKey32 } from '../utils/padHexKey32';
import { Address } from './Address';

@injectable()
export class EvmStorage {
  public storage: Record<string, BigNumber> = {};

  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    this.storage[padKey32({ key })] = value;
  }

  public async read({
    key,
    address,
  }: {
    key: BigNumber | number;
    address: Address;
  }): Promise<BigNumber> {
    return this.readSync({ key, address });
  }

  public hasKey({ key }: { key: BigNumber | number }) {
    return padKey32({ key }) in this.storage;
  }

  public readSync({
    key,
    address,
  }: {
    key: BigNumber | number;
    address: Address;
  }): BigNumber {
    return this.storage[padKey32({ key })] || new BigNumber(0);
  }

  public isEqualOriginal({ key }: { key: BigNumber }) {
    // TODO: Fully implement this.
    // it should basically do copy of the memory before execution and check against it.
    return true;
  }

  public isOriginallyZero({
    key,
    address,
  }: {
    key: BigNumber;
    address: Address;
  }) {
    // Should check the original storage.
    return this.readSync({ key, address }).isEqualTo(0);
  }

  public forEach(callback: (key: BigNumber, value: BigNumber) => void) {
    return Object.entries(this.storage).map((item) => {
      callback(new BigNumber(item[0]), item[1]);
    });
  }
}
