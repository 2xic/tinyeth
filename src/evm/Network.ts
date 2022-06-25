import { injectable } from 'inversify';
import { Contract } from './Contract';

@injectable()
export class Network {
  private _contracts: Record<string, Contract> = {};

  public register({ contract }: { contract: Contract }) {
    this._contracts[contract.address] = contract;
  }

  public get(inputAddress: string): Contract {
    let address = inputAddress;
    if (!address.startsWith('0x')) {
      address = `0x${address}`;
    }
    return this._contracts[address];
  }

  public get contracts(): Contract[] {
    return Object.values(this._contracts);
  }
}
