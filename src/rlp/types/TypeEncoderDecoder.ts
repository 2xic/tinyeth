import { InputTypes } from '../RlpEncoder';

export abstract class TypeEncoderDecoder<T> {
  public abstract encode({
    input,
    encoder,
  }: {
    input: T;
    encoder: ({ input }: { input: InputTypes }) => EncodingResults;
  }): EncodingResults;

  public abstract isEncodeType({ input }: { input: unknown }): boolean;

  public abstract decode({
    input,
    fromIndex,
    decoder,
  }: {
    input: Buffer;
    fromIndex: number;
    decoder: ({
      input,
      index,
    }: {
      input: Buffer;
      index: number;
    }) => DecodingResults;
  }): DecodingResults;

  public abstract isDecodeType({ input }: { input: number }): boolean;
}

export interface EncodingResults {
  encoding: string;
  length: number;
}

export interface DecodingResults {
  decoding: string | number;
  newIndex: number;
}
