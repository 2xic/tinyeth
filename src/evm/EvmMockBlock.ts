import BigNumber from 'bignumber.js';
import { Dayjs } from 'dayjs';
import { injectable } from 'inversify';
import { Address } from './Address';

@injectable()
export class EvmMockBlock {
  constructor(
    private options: {
      blockHash: string;
      timeStamp: Dayjs;
      height: number;
      coinbase: Address;
      difficulty: BigNumber;
      gasLimit: number;
      chainId: number;
    }
  ) {}

  public get hash(): BigNumber {
    return new BigNumber(this.options.blockHash, 16);
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
}
