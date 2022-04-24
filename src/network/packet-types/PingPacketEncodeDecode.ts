import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { PacketEncodeDecode } from './PacketEncodeDecode';

export class PingPacketEncodeDecode implements PacketEncodeDecode<PingPacket> {
  public decode(options: { input: SimpleTypes[] }): PingPacket {
    const [version] = options.input;
    if (!(typeof version == 'number' || typeof version === 'string')) {
      throw new Error('version is not a string');
    }

    return {
      version: typeof version === 'string' ? parseInt(version) : version,
    };
  }
}

export interface PingPacket {
  version: number;
}
