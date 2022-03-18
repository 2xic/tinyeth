import BigNumber from "bignumber.js";
import { RlpEncoder } from "../rlp/RlpEncoder";

export class RawTransaction {
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
