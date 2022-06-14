import { getBufferFromHex } from '../../../utils/getBufferFromHex';

export function RlpxHelloMessageEncoder({
  publicKey,
  listenPort,
}: {
  publicKey: string;
  listenPort: number;
}) {
  const packet = {
    protocolVersion: 5,
    capabilities: [],
    userAgent: 'tinyeth',
    listenPort,
    nodeId: `0x${publicKey}`,
  };
  return [
    packet.protocolVersion,
    packet.userAgent,
    packet.capabilities,
    packet.listenPort,
    getBufferFromHex(packet.nodeId),
  ];
}
