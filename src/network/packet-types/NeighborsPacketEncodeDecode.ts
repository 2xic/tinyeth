import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { PacketEncodeDecode } from './PacketEncodeDecode';

export class NeighborsPacketEncodeDecode
  implements PacketEncodeDecode<NeighborsPacket>
{
  public decode(options: { input: SimpleTypes[] }): NeighborsPacket {
    const [nodes] = options.input;
    if (!Array.isArray(nodes)) {
      throw new Error('nodes is not an array');
    }
    const parsedNodes: NodeProperties[] = [];
    for (const node of nodes) {
      if (!Array.isArray(node)) {
        throw new Error('node is not an array');
      }
      const [ip] = node;
      if (!(typeof ip == 'string')) {
        throw new Error('expected ip to be a string');
      }
      parsedNodes.push({
        ip,
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
}
