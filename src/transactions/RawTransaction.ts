import BigNumber from "bignumber.js";
import { RlpEncoder } from "../rlp/RlpEncoder";
import createKeccakHash from "keccak";
import { KeyPair } from "../signatures/KeyPair";

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
      input: this.params,
    });
  }

  public signed({
    privateKey,
    chainId,
  }: {
    privateKey: string;
    chainId: number;
  }) {
    const rawTransaction = this.encode();
    const message = createKeccakHash("keccak256")
      .update(Buffer.from(rawTransaction, "hex"))
      .digest()
      .toString("hex");

    const { signature, recovery } = new KeyPair().signMessage({
      privateKey,
      message,
    });
    // same as https://github.com/ethereumjs/ethereumjs-util/blob/f51bfcab9e5505dfed4819ef1336f9fc00a12c3d/src/signature.ts#L38
    const r = Buffer.from(signature.slice(0, 32));
    const v = chainId ? recovery + (chainId * 2 + 35) : recovery + 27;
    const s = Buffer.from(signature.slice(32, 64));

    return new RlpEncoder().encode({
      input: [...this.params, v, r.toString("hex"), s.toString("hex")],
    });
  }

  private get params() {
    return [
      this.nonce,
      this.gasprice,
      this.startgas,
      this.to,
      this.value,
      this.data,
    ];
  }
}
