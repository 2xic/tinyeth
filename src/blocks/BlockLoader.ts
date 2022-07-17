import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from '../evm/Address';
import { RlpDecoder } from '../rlp';
import { ReadOutRlp } from '../rlp/ReadOutRlp';
import { SimpleTypes } from '../rlp/types/TypeEncoderDecoder';

@injectable()
export class BlockLoader {
  constructor(private rlpDecoder: RlpDecoder) {}

  public load({ block }: { block: string }): Block {
    const rlp = this.rlpDecoder.decode({ input: block });
    const rlpParser = new ReadOutRlp(rlp);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, __, coinbase] = rlpParser.readArray<Buffer>({
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
      transaction,
    };
  }
}

interface Block {
  coinbase: string;
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
