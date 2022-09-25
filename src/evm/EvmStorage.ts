/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { padKey32 } from '../utils/padHexKey32';
import { Address } from './Address';

@injectable()
export class EvmStorage {
  public storage: Partial<Record<string, BigNumber>> = {};

  public originalStorageValue: Partial<Record<string, BigNumber>> = {};

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

  public isEqualOriginal({
    key,
    address,
  }: {
    key: BigNumber;
    address: Address;
  }) {
    const originalValue = this.readOriginalValue({ key, address });
    return originalValue.isEqualTo(
      this.readSync({
        key,
        address: new Address('0xdeadbeef'),
      })
    );
  }

  public isOriginallyZero({
    key,
    address,
  }: {
    key: BigNumber;
    address: Address;
  }) {
    const originalValue = this.readOriginalValue({ key, address });
    return originalValue.isEqualTo(0);
  }

  public readOriginalValue({
    key,
    address,
  }: {
    key: BigNumber;
    address: Address;
  }) {
    return this.originalStorageValue[padKey32({ key })] || new BigNumber(0);
  }

  public forEach(callback: (key: BigNumber, value: BigNumber) => void) {
    return Object.entries(this.storage).map((item) => {
      callback(
        new BigNumber(item[0]),
        this.readSync({
          key: new BigNumber(item[0]),
          address: new Address('0xdeadbeef'),
        })
      );
    });
  }
}
