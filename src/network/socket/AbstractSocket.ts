export abstract class AbstractSocket {
  public abstract on(
    event: 'close',
    listener: (hadError: boolean) => void
  ): this;
  public abstract on(event: 'connect', listener: () => void): this;
  public abstract on(event: 'data', listener: (data: Buffer) => void): this;
  public abstract on(event: 'drain', listener: () => void): this;
  public abstract on(event: 'end', listener: () => void): this;
  public abstract on(event: 'error', listener: (err: Error) => void): this;
  public abstract on(
    event: 'lookup',
    listener: (
      err: Error,
      address: string,
      family: string | number,
      host: string
    ) => void
  ): this;
  public abstract on(event: 'ready', listener: () => void): this;
  public abstract on(event: 'timeout', listener: () => void): this;

  public abstract connect(
    port: number,
    host: string,
    connectionListener?: () => void
  ): this;

  public abstract destroy(): void;

  public abstract write(
    message: Buffer,
    callback: (error?: Buffer) => void
  ): void;
}
