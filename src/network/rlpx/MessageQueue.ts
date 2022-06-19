import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import { getNumberFromBuffer } from '../utils/getNumberFromBuffer';

@injectable()
export class MessageQueue {
  constructor(private logger: Logger) {}

  private data: Buffer = Buffer.alloc(0);
  private limit?: number = undefined;
  private _isReady = false;

  public add(data: Buffer) {
    if (!this.limit) {
      // First message should always contain the length
      // We should also be in the AUTH/ACK state.
      this.limit = getNumberFromBuffer(data.slice(0, 2)) + 2;
    }
    this.data = Buffer.concat([this.data, data]);
    this._isReady = true;
  }

  public read(): Buffer {
    if (!this.limit) {
      throw new Error('Limit is not set');
    } else if (this.limit <= this.data.length) {
      const limit = this.limit === 0 ? this.data.length : this.limit;
      const oldBatch = this.data.slice(0, limit);
      this.data = this.data.slice(limit);
      return oldBatch;
    } else {
      this.logger.log(
        `Waiting on more data (limit : ${this.limit}, data: ${this.data.length}) `
      );
      return Buffer.alloc(0);
    }
  }

  public setLimit({ size }: { size: number }) {
    this.limit = size;
  }

  public get isReady(): boolean {
    return this._isReady;
  }
}

export const HEADER_SIZE = 32;
