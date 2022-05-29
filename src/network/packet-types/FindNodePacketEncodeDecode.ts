import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { PacketEncodeDecode } from './PacketEncodeDecode';

export class FindNodePacketEncodeDecode
  implements PacketEncodeDecode<FindNodePacket>
{
  public encode(): SimpleTypes {
    throw new Error('Method not implemented.');
  }

  public decode(options: { input: SimpleTypes[] }): FindNodePacket {
    const [target] = options.input;
    if (typeof target !== 'string') {
      throw new Error('Wrong to target type');
    }

    return {
      target,
    };
  }
}

export interface FindNodePacket {
  target: string;
}
