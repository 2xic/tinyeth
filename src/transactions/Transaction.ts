import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { RawTransaction } from './RawTransaction';

@injectable()
export class Transactions {
  constructor(private rawTransaction: RawTransaction) {}

  public construct({
    nonce,
    gasPrice,
    startGas,
    to,
    value,
    data,
  }: {
    nonce: number;
    gasPrice: BigNumber;
    startGas: number;
    to: BigNumber;
    value: BigNumber;
    data: string;
  }): RawTransaction {
    return this.rawTransaction.construct(
      nonce,
      gasPrice,
      startGas,
      to,
      value,
      data
    );
  }
}
