export abstract class TypeEncoderDecoder<T> {
  public abstract encode({ input }: { input: T }): Results;

  public abstract decode({ input }: { input: T }): Results;
}

export interface Results {
  encoding: string;
  bytes: number;
}
