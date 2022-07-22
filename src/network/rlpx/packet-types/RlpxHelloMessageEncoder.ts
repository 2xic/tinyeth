import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import os from 'os';
import { assertEqual } from '../../../utils/enforce';
import { ChainInformation } from '../../ChainInformation';
import { NodeId } from '../NodeId';
import { injectable } from 'inversify';

@injectable()
export class SimpleRplxHelloMessageEncoder {
  constructor(
    private chainInformation: ChainInformation,
    private nodeId: NodeId
  ) {}

  public simpleRlpxHelloMessageEncoder() {
    const chain = this.chainInformation.chainInformation;
    const packet = {
      protocolVersion: 5,
      // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#eth62-2015
      capabilities: chain.capabilities,
      userAgent: chain.userAgent,
      listenPort: chain.listenPort,
      nodeId: getBufferFromHex(`0x${this.nodeId.nodeId}`),
    };
    assertEqual(getBufferFromHex(packet.nodeId).length, 64, 'wrong length');

    return [
      packet.protocolVersion,
      packet.userAgent,
      packet.capabilities,
      packet.listenPort,
      getBufferFromHex(packet.nodeId),
    ];
  }
}
