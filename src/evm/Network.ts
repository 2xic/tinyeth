import { Contract } from './Contract';

export class Network {
  private _contracts: Record<string, Contract> = {};

  public register({ contract }: { contract: Contract }) {
    this._contracts[contract.address] = contract;
  }

  public get(address: string): Contract {
    return this._contracts[address];
  }

  public get contracts(): Contract[] {
    return Object.values(this._contracts);
  }
}
