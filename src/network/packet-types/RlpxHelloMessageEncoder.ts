import { getBufferFromHex } from '../../utils/getBufferFromHex';

export function RlpxHelloMessageEncoder(publicKey: string) {
  const packet = {
    protocolVersion: 5,
    capabilities: [],
    userAgent: 'tinyeth',
    listenPort: 0,
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
