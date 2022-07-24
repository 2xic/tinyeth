import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { Signatures } from '../signatures/Signatures';
import { SignedTransaction } from './SignedTransaction';
import { keccak256 } from '../utils/keccak256';
import { injectable } from 'inversify';

@injectable()
export class RawTransaction {
  constructor(private signatures: Signatures) {}

  private nonce?: number;
  private gasPrice?: BigNumber;
  private startGas?: number;
  private to?: BigNumber;
  private value?: BigNumber;
  private data?: string;

  public construct(
    nonce: number,
    gasprice: BigNumber,
    startGas: number,
    to: BigNumber,
    value: BigNumber,
    data: string
  ) {
    this.nonce = nonce;
    this.gasPrice = gasprice;
    this.startGas = startGas;
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

    const { r, s, v } = this.signatures.signTransaction({
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
      this.gasPrice,
      this.startGas,
      this.to,
      this.value,
      this.data,
    ];
  }
}
