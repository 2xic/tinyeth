import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import { SignedTransaction } from './SignedTransaction';
import { keccak256 } from '../network/keccak256';
import { injectable } from 'inversify';

@injectable()
export class RawTransaction {
  constructor(private keyPair: KeyPair) {}

  private nonce?: number;
  private gasprice?: BigNumber;
  private startgas?: number;
  private to?: BigNumber;
  private value?: BigNumber;
  private data?: string;

  public construct(
    nonce: number,
    gasprice: BigNumber,
    startgas: number,
    to: BigNumber,
    value: BigNumber,
    data: string
  ) {
    this.nonce = nonce;
    this.gasprice = gasprice;
    this.startgas = startgas;
    this.to = to;
    this.value = value;
    this.data = data;
    return this;
  }

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

    const { r, s, v } = this.keyPair.signTransaction({
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get params(): any[] {
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
