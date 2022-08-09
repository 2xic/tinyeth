import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { injectable } from 'inversify';
import { Address } from './Address';
import { Contract } from './Contract';
import { EvmMockBlock } from './EvmMockBlock';

@injectable()
export class Network {
  // TODO: This should also be encapsulated in a cleaner way
  //      ref same note in contract.

  private _contracts: Record<string, Contract> = {};

  private _blocks: Record<string, EvmMockBlock> = {};

  private _currentBlock: EvmMockBlock;

  constructor() {
    this._blocks[42] = new EvmMockBlock({
      blockHash:
        '29045A592007D0C246EF02C2223570DA9522D0CF0F73282C79A1BC8F0BB2C238',
      timeStamp: dayjs('2022-01-01'),
      height: 42,
      coinbase: new Address('5B38Da6a701c568545dCfcB03FcB875f56beddC4'),
      gasLimit: 0xffffffffffff,
      difficulty: new BigNumber('10995000000000000'),
      chainId: 1,
      gasPrice: 222,
      baseFee: 1024,
    });
    this._currentBlock = this._blocks[42];
  }

  public register({ contract }: { contract: Contract }) {
    const address = contract.address.toString();
    if (address in this._contracts) {
      return false;
    } else {
      this._contracts[address] = contract;
      return true;
    }
  }

  public get(inputAddress: Address): Contract {
    return this._contracts[inputAddress.toString()];
  }

  public get contracts(): Contract[] {
    return Object.values(this._contracts);
  }

  public getBlock({ height }: { height: number }): EvmMockBlock {
    if (!(height in this._blocks)) {
      throw new Error('Unknown block');
    }
    return this._blocks[height];
  }

  public get block(): EvmMockBlock {
    return this._currentBlock;
  }
}
