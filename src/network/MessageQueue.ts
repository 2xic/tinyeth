import { injectable } from 'inversify';

@injectable()
export class MessageQueue {
  private list: Buffer[] = [];

  private eventHandler?: (buffer: Buffer) => Promise<void>;

  public push(message: Buffer) {
    this.list.push(message);
  }

  public setEventHandler(eventHandler: (buffer: Buffer) => Promise<void>) {
    this.eventHandler = eventHandler;
  }

  public async process(): Promise<void> {
    const results = this.list.shift() || Buffer.from([]);
    if (this.eventHandler) {
      if (results.length) {
        await this.eventHandler(results);
      }
    }
  }
}
