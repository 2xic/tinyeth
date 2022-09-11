import BigNumber from 'bignumber.js';
import { Dayjs } from 'dayjs';
import { injectable } from 'inversify';
import { Address } from './Address';

@injectable()
export class EvmMockBlock {
  constructor(private options: EvmBlock) {}

  public get hash(): BigNumber {
    const value = this.options.blockHash.toLowerCase().trim();
    return new BigNumber(value, 16);
  }

  public get coinbase(): BigNumber {
    return this.options.coinbase.raw;
  }

  public get timeStamp() {
    return this.options.timeStamp;
  }

  public get height() {
    return this.options.height;
  }

  public get gasLimit() {
    return this.options.gasLimit;
  }

  public get difficulty() {
    return this.options.difficulty;
  }

  public get chainId() {
    return this.options.chainId;
  }

  public get baseFee() {
    return this.options.baseFee;
  }

  public get gasPrice() {
    return this.options.gasPrice;
  }
}

export interface EvmBlock {
  blockHash: string;
  timeStamp: Dayjs;
  height: number;
  coinbase: Address;
  difficulty: BigNumber;
  gasLimit: number;
  gasPrice: number;
  chainId: number;
  baseFee: number;
}
