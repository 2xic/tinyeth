import BigNumber from 'bignumber.js';
import { RawTransaction } from './RawTransaction';

export class Transactions {
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
		return new RawTransaction(nonce, gasprice, startgas, to, value, data);
	}
}
