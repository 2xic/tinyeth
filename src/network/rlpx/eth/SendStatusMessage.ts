import { injectable } from 'inversify';
import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { Messages } from './Messages';
import { convertNumberToPadHex } from '../../../utils/convertNumberToPadHex';
import { FrameCommunication } from '../../auth/frameing/FrameCommunication';
import { SnappyCompress } from '../SnappyCompress';
import { ChainInformation } from '../../ChainInformation';
import { ForkId } from './ForkId';
import { RlpxMessageEncoder } from '../RlpxMessageEncoder';

@injectable()
export class SendStatusMessage {
  constructor(
    private rlpEncoder: RlpEncoder,
    private frameCommunication: FrameCommunication,
    private chainInformation: ChainInformation,
    private forkId: ForkId,
    private rlpxMessageEncoder: RlpxMessageEncoder
  ) {}

  public sendStatus({ version }: { version: number }) {
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

    // [version: P, networkid: P, td: P, blockhash: B_32, genesis: B_32, forkid]
    console.log(version);
    const payload = [
      67,
      Number(this.chainInformation.chainInformation.chainId),
      this.chainInformation.chainInformation.difficulty,
      getBufferFromHex(this.chainInformation.chainInformation.bestBlockHash),
      getBufferFromHex(this.chainInformation.chainInformation.genesisHash),
      // fork hash hardcoded.
      getBufferFromHex(this.forkId.calculate({})),
    ];

    const message = this.rlpxMessageEncoder.encodeStatusMessage({
      code: Messages.STATUS,
      payload,
    });

    return message;
  }
}
