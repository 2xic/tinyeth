import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';

export abstract class PacketEncodeDecode<T> {
  public abstract decode(options: { input: SimpleTypes }): T;
}
