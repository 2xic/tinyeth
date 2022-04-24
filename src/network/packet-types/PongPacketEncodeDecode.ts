import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { PacketEncodeDecode } from './PacketEncodeDecode';

export class PongPacketEncodeDecode implements PacketEncodeDecode<PongPacket> {
  public decode(options: { input: SimpleTypes[] }): PongPacket {
    const [to] = options.input;
    if (!Array.isArray(to)) {
      throw new Error('to is not an array');
    }
    const [toAddress] = to;
    if (typeof toAddress !== 'string') {
      throw new Error('Wrong to address type');
    }

    return {
      to: toAddress,
    };
  }
}

export interface PongPacket {
  to: string;
}
