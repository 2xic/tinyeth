import { injectable } from 'inversify';
import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { Messages } from './Messages';

@injectable()
export class GetBlockHeader {
  constructor(private rlpEncoder: RlpEncoder) {}

  public getBlockHeader({ blockHeight }: { blockHeight: number }) {
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

    const payload = this.rlpEncoder.encode({
      input: [blockHeight, 1, 0, 0],
    });

    return Buffer.concat([
      getBufferFromHex(
        this.rlpEncoder.encode({
          input: Messages.GET_BLOCK_HEADER,
        })
      ),
      getBufferFromHex(payload),
    ]);
  }
}
