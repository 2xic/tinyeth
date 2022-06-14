import { injectable } from 'inversify';
import { RlpEncoder } from '../../rlp/RlpEncoder';
import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { PacketEncodeDecode } from './PacketEncodeDecode';

@injectable()
export class FindNodePacketEncodeDecode
  implements PacketEncodeDecode<FindNodePacket>
{
  public encode(options: { input: FindNodePacket }): string {
    return new RlpEncoder().encode({
      input: [getBufferFromHex(options.input.target), options.input.expiration],
    });
  }

  public decode(options: { input: SimpleTypes[] }): FindNodePacket {
    const [target, expiration] = options.input;
    if (typeof target !== 'string') {
      throw new Error(`Wrong to target type ( ${target} )`);
    }
    if (typeof expiration !== 'string') {
      throw new Error(`Wrong to target type ( ${expiration} )`);
    }

    return {
      target,
      expiration: parseInt(expiration, 16),
    };
  }
}

export interface FindNodePacket {
  target: string;
  expiration: number;
}
