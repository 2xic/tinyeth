import { injectable } from 'inversify';
import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { FrameCommunication } from '../../auth/frameing/FrameCommunication';
import { ChainInformation } from '../../ChainInformation';
import { ForkId } from './ForkId';
import { RlpxMessageEncoder } from '../RlpxMessageEncoder';
import { EthMessageType } from '../CommunicationState';

@injectable()
export class SendStatusMessage {
  constructor(
    private rlpEncoder: RlpEncoder,
    private frameCommunication: FrameCommunication,
    private chainInformation: ChainInformation,
    private forkId: ForkId,
    private rlpxMessageEncoder: RlpxMessageEncoder
  ) {}

  public sendStatus() {
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

    // [version: P, networkid: P, td: P, blockhash: B_32, genesis: B_32, forkid]
    const payload = [
      67,
      Number(this.chainInformation.chainInformation.chainId),
      this.chainInformation.chainInformation.difficulty,
      getBufferFromHex(this.chainInformation.chainInformation.bestBlockHash),
      getBufferFromHex(this.chainInformation.chainInformation.genesisHash),
      // fork hash hardcoded.
      this.forkId.calculate({}),

      //[getBufferFromHex('fc64ec04'), getBufferFromHex('118c30')],
    ];

    const message = this.rlpxMessageEncoder.encodeEthMessage({
      code: EthMessageType.STATUS,
      payload,
    });

    return message;
  }
}
