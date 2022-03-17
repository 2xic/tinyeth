import { NullLiteral } from "typescript";

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
    gasprice: number;
    startgas: number;
    to: string;
    value: string;
    data: string;
  }) {
    // private get chain
    const chainId = "1337";
  }
}
