import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';

@injectable()
export class AccessSets {
  // Todo : test against this https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-2-access-sets
  private touchedAddresses: Record<string, boolean> = {};

  private touchedStorageSlots: Record<string, Record<string, boolean>> = {};

  public touchAddress({ address }: { address: string }) {
    this.touchedAddresses[address] = true;
  }

  public isColdAddress({ address }: { address: string }): boolean {
    return address in this.touchedAddresses;
  }

  public touchStorageSlot({ address, key }: { address: string; key: string }) {
    if (!(address in this.touchedStorageSlots)) {
      this.touchedStorageSlots[address] = {};
    }
    this.touchedStorageSlots[address][key] = true;
  }

  public isColdSlot({
    address,
    key,
  }: {
    address: string;
    key: BigNumber;
  }): boolean {
    return !(
      address in this.touchedStorageSlots &&
      key.toString(16) in this.touchedStorageSlots[address]
    );
  }

  public revert() {
    // See important notes in https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-2-access-sets
    throw new Error('Not handled yet');
  }
}
