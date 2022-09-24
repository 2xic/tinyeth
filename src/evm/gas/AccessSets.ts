import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { padKey32 } from '../../utils/padHexKey32';

@injectable()
export class AccessSets {
  // Todo : test against this https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-2-access-sets
  private touchedAddresses: Record<string, boolean> = {};

  private touchedStorageSlots: Record<string, Record<string, boolean>> = {};

  public touchAddress({ address }: { address: BigNumber }) {
    this.touchedAddresses[address.toString(16)] = true;
  }

  public isColdAddress({ address }: { address: BigNumber }): boolean {
    return !(address.toString(16) in this.touchedAddresses);
  }

  public touchStorageSlot({
    address,
    key,
  }: {
    address: string;
    key: BigNumber;
  }) {
    if (!(address in this.touchedStorageSlots)) {
      this.touchedStorageSlots[address] = {};
    }
    this.touchedStorageSlots[address][padKey32({ key })] = true;
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
      padKey32({ key }) in this.touchedStorageSlots[address]
    );
  }

  public revert() {
    // See important notes in https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-2-access-sets
    throw new Error('Not handled yet');
  }
}
