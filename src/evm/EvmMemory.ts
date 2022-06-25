import { injectable } from 'inversify';

@injectable()
export class EvmMemory {
  public memory!: Buffer;

  constructor() {
    this.memory = Buffer.alloc(2048, 0);
  }
}
