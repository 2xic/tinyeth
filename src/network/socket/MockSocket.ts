/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { AbstractSocket } from './AbstractSocket';

@injectable()
export class MockSocket implements AbstractSocket {
  private registeredCallback: Record<
    string,
    (argument: unknown) => Promise<void>
  > = {};

  public writtenData: Buffer[] = [];

  public on(event: any, listener: any): this {
    this.registeredCallback[event] = listener;
    return this;
  }

  public async emit(event: any, argument: any) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      await this.registeredCallback[event](argument)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  public connect(port: number, host: string, connectionListener?: () => void) {
    if (connectionListener) {
      connectionListener();
    }
    return this;
  }

  public destroy(): void {
    throw new Error('Method not implemented.');
  }
  public write(message: Buffer, callback: (error?: Buffer) => void): void {
    this.writtenData.push(message);
    callback();
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setTimeout(): void {}
}
