export abstract class TypeEncoderDecoder<T> {
  public abstract encode({ input }: { input: T }): EncodingResults;

  public abstract decode({ input }: { input: T | Buffer }): DecodingResults;
}

export interface EncodingResults {
  encoding: string;
  length: number;
}

export interface DecodingResults {
  decoding: string;
  newIndex: number;
}
