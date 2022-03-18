import BigNumber from "bignumber.js";
import { isConstructorDeclaration, NullLiteral } from "typescript";
import { RlpEncoder } from "../rlp/encode";

export class Transactions {
  constructor() {}

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
  }): Transaction {
    // private get chain
    const chainId = "1337";

    return new Transaction(nonce, gasprice, startgas, to, value, data);
  }
}

class Transaction {
  constructor(
    private nonce: number,
    private gasprice: BigNumber,
    private startgas: number,
    private to: BigNumber,
    private value: BigNumber,
    private data: string
  ) {}

  public encode() {
    return new RlpEncoder().encode({
      input: [
        this.nonce,
        this.gasprice,
        this.startgas,
        this.to,
        this.value,
        this.data,
      ],
    });
  }
}
