import { injectable } from 'inversify';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { getNumberFromBuffer } from '../utils/getNumberFromBuffer';
import { parseHexIp } from '../utils/parseHexIp';
import { PacketEncodeDecode } from './PacketEncodeDecode';

@injectable()
export class NeighborsPacketEncodeDecode
  implements PacketEncodeDecode<NeighborsPacket>
{
  public encode(): SimpleTypes {
    throw new Error('Method not implemented.');
  }

  public decode(options: { input: SimpleTypes[] }): NeighborsPacket {
    const [nodes] = options.input;
    if (!Array.isArray(nodes)) {
      throw new Error('nodes is not an array');
    }
    const parsedNodes: NodeProperties[] = [];
    for (const node of nodes) {
      const decoder = new ReadOutRlp(node);
      const [ip, tcpPort, udpPort, publicKey] = decoder.readArray<Buffer>({
        length: 3,
        isBuffer: true,
        isFlat: true,
      });

      parsedNodes.push({
        ip: parseHexIp(ip),
        tcpPort: getNumberFromBuffer(tcpPort),
        udpPort: getNumberFromBuffer(udpPort),
        publicKey,
      });
    }

    return {
      nodes: parsedNodes,
    };
  }
}

export interface NeighborsPacket {
  nodes: NodeProperties[];
}

interface NodeProperties {
  ip: string;
  tcpPort: number;
  udpPort: number;
  publicKey: Buffer;
}
