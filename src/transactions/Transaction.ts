import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { RawTransaction } from './RawTransaction';

@injectable()
export class Transactions {
  constructor(private rawTransaction: RawTransaction) {}

  public construct({
    nonce,
    gasprice,
    startgas,
    to,
    value,
    data,
  }: {
    nonce: number;
    gasprice: BigNumber;
    startgas: number;
    to: BigNumber;
    value: BigNumber;
    data: string;
  }): RawTransaction {
    return this.rawTransaction.construct(
      nonce,
      gasprice,
      startgas,
      to,
      value,
      data
    );
  }
}
