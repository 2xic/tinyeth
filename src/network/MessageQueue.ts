import { injectable } from 'inversify';

@injectable()
export class MessageQueue {
  private list: Buffer[] = [];

  public push(message: Buffer) {
    this.list.push(message);
  }

  public pop(): Buffer {
    const results = this.list.shift() || Buffer.from([]);
    return results;
  }
}
