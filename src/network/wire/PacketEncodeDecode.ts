import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';

export abstract class PacketEncodeDecode<I> {
  public abstract encode(options: { input: I }): SimpleTypes;

  public abstract decode(options: { input: SimpleTypes }): I;
}
