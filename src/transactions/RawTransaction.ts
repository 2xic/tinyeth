import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../rlp/RlpEncoder';
import createKeccakHash from 'keccak';
import { KeyPair } from '../signatures/KeyPair';

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
    chainId?: number;
  }) {
    const rawTransaction = this.encode();
    const message = createKeccakHash('keccak256')
      .update(Buffer.from(rawTransaction.slice(2), 'hex'))
      .digest();

    const { r, s, v } = new KeyPair().signTransaction({
      privateKey,
      message,
      chainId,
    });

    return new RlpEncoder().encode({
      input: [...this.params, v, new Uint8Array(r), new Uint8Array(s)],
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
