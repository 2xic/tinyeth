import { injectable } from 'inversify';
import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { Messages } from './Messages';
import { convertNumberToPadHex } from '../../../utils/convertNumberToPadHex';
import { FrameCommunication } from '../../auth/frameing/FrameCommunication';

@injectable()
export class SendStatusMessage {
  constructor(
    private rlpEncoder: RlpEncoder,
    private frameCommunication: FrameCommunication
  ) {}

  public sendStatus({ version }: { version: number }) {
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

    // [version: P, networkid: P, td: P, blockhash: B_32, genesis: B_32, forkid]

    const payload = this.rlpEncoder.encode({
      input: [
        version,
        1,
        getBufferFromHex(convertNumberToPadHex(17179869184)),
        // Genesis block
        getBufferFromHex(
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
        ),
        getBufferFromHex(
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
        ),
      ],
    });

    const message = Buffer.concat([
      getBufferFromHex(
        this.rlpEncoder.encode({
          input: Messages.STATUS,
        })
      ),
      getBufferFromHex(payload),
    ]);

    return this.frameCommunication.encode({
      message,
    });
  }
}
