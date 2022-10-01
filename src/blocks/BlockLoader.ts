import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from '../evm/Address';
import { RlpDecoder } from '../rlp';
import { ReadOutRlp } from '../rlp/ReadOutRlp';
import { SimpleTypes } from '../rlp/types/TypeEncoderDecoder';
import { getBigNumberFromBuffer } from '../utils/getBigNumberFromBuffer';

@injectable()
export class BlockLoader {
  constructor(private rlpDecoder: RlpDecoder) {}

  public load({ block }: { block: string }): Block {
    const rlp = this.rlpDecoder.decode({ input: block });
    const rlpParser = new ReadOutRlp(rlp);

    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      __,
      coinbase,
      root,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ___,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _____,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ______,
      difficultly,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ________,
      gasLimit,
      gasUsed,
      timestamp,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _________,
      mixDigest,
      blockNonce,
    ] = rlpParser.readArray<Buffer>({
      length: -1,
      convertToBuffer: true,
    });

    const transaction: Transaction[] = [];
    const transactionsRlp = rlpParser.readArray<SimpleTypes[]>({
      length: 1,
    });

    const subArray = new ReadOutRlp(transactionsRlp);
    while (!subArray.done) {
      const [nonce, gasPrice, startgas, to, value, data] =
        subArray.readArray<Buffer>({
          length: -1,
          convertToBuffer: true,
        });

      transaction.push({
        nonce: parseInt(nonce.toString()),
        gasPrice: new BigNumber(gasPrice.toString('hex'), 16),
        startGas: new BigNumber(startgas.toString('hex'), 16),
        to: new Address(new BigNumber(to.toString('hex'), 16)),
        value: new BigNumber(value.toString('hex'), 16),
        data,
      });
    }

    return {
      coinbase: coinbase.toString('hex'),
      root: root.toString('hex'),
      difficultly: getBigNumberFromBuffer(difficultly).toNumber(),
      gasLimit: getBigNumberFromBuffer(gasLimit).toNumber(),
      gasUsed: getBigNumberFromBuffer(gasUsed).toNumber(),
      timestamp: getBigNumberFromBuffer(timestamp).toNumber(),
      mixDigest: mixDigest.toString('hex'),
      nonce: blockNonce.toString('hex'),
      transaction,
    };
  }

  public validate() {
    /**
     * Verify
     *  - Uncles
     *  - TransactionRoot
     *  - Metadata
     *     - Gas usage
     *     - timestamp 
     */
    throw new Error('Not implemented');
  }
}

interface Block {
  coinbase: string;
  root: string;
  difficultly: number;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
  mixDigest: string;
  nonce?: string;

  transaction: Transaction[];
}

interface Transaction {
  nonce: number;
  gasPrice: BigNumber;
  startGas: BigNumber;
  to: Address;
  value: BigNumber;
  data: Buffer;
}
