import { OpCode } from './OpCode';
import { opcodes } from './Opcodess';

export class Evm {
  public stack: number[] = [];

  public memory!: Buffer;

  public storage: Record<number, number> = {};

  private pc: number;

  constructor(public buffer: Buffer) {
    this.memory = Buffer.alloc(2048, 0);
    this.pc = 0;
  }

  public step(): boolean {
    if (!(this.pc < this.buffer.length)) {
      return false;
    }

    const opcode = this.loadOpcode({ opcode: this.buffer[this.pc] });
    opcode.onExecute({
      evm: this,
      byteIndex: this.pc,
    });
    this.pc += opcode.length;

    return true;
  }

  public execute() {
    while (this.pc < this.buffer.length) {
      this.step();
    }
  }

  private loadOpcode({ opcode: opcodeNumber }: { opcode: number }): OpCode {
    const opcode = opcodes[opcodeNumber];
    if (!opcode) {
      throw new Error(`0x${opcodeNumber.toString(16)}`);
    }
    return opcode;
  }
}
