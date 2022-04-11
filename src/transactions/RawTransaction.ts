import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../rlp/RlpEncoder';
import createKeccakHash from 'keccak';
import { KeyPair } from '../signatures/KeyPair';
import { SignedTransaction } from './SignedTransaction';
import { keccak256 } from '../network/keccak256';

export class RawTransaction {
  constructor(
    private nonce: number,
    private gasprice: BigNumber,
    private startgas: number,
    private to: BigNumber,
    private value: BigNumber,
    private data: string
  ) {}

  public encode(): string {
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
  }): SignedTransaction {
    const rawTransaction = this.encode();
    const message = keccak256(Buffer.from(rawTransaction.slice(2), 'hex'));

    const { r, s, v } = new KeyPair().signTransaction({
      privateKey,
      message,
      chainId,
    });

    return new SignedTransaction(
      new RlpEncoder().encode({
        input: [...this.params, v, new Uint8Array(r), new Uint8Array(s)],
      })
    );
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
