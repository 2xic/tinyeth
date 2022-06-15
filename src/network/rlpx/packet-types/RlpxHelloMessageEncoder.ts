import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import os from 'os';
import { assertEqual } from '../../../utils/enforce';

export function RlpxHelloMessageEncoder({
  publicKey,
  listenPort,
}: {
  publicKey: string;
  listenPort: number;
}) {
  const packet = {
    protocolVersion: 4,
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#eth62-2015
    capabilities: [
      ['eth', 62],
      ['eth', 63],
      ['eth', 67],
    ],
    userAgent: `tinyeth/v0.0.1/${os.platform()}-${os.arch()}/nodejs`,
    listenPort,
    nodeId: `0x${publicKey}`,
  };
  assertEqual(getBufferFromHex(packet.nodeId).length, 64, 'wrong length');
  return [
    packet.protocolVersion,
    packet.userAgent,
    packet.capabilities,
    0, //packet.listenPort,
    getBufferFromHex(packet.nodeId),
  ];
}
