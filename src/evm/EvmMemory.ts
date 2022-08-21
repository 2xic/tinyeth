import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { MemoryExpansionGas } from './gas/MemoryExpansionGas';

// TODO: should be restricted to 32 bit size

@injectable()
export class EvmMemory {
  private memory!: Buffer;

  constructor(private memoryAccess: MemoryExpansionGas) {
    this.memory = Buffer.alloc(0, 0);
  }

  public get size() {
    return this.memory.length;
  }

  public read32(offset: number) {
    return this.read(offset, 32);
  }

  public read(offset: number, length: number) {
    const readMax = offset + length;
    if (this.memory.length < readMax) {
      this.expand(readMax);
    }
    return this.memory.slice(offset, readMax);
  }

  public write(offset: number, value: number) {
    this.expand(offset);
    this.memory[offset] = value;
  }

  private expand(offset: number) {
    const delta = 32 + (offset % 32 == 0 ? 0 : 32);
    if (this.memory.length <= offset) {
      this.memory = Buffer.concat([this.memory, Buffer.alloc(delta, 0)]);
    }
  }

  public get raw() {
    return this.memory;
  }
}
