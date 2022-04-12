import { InvalidatedProjectKind } from 'typescript';
import { EvmStack } from './EvmStack';
import { InvalidPc } from './InvalidPc';
import { OpCode } from './OpCode';
import { opcodes } from './Opcodess';
import { Wei } from './Wei';

export class Evm {
  public stack: EvmStack = new EvmStack();

  public memory!: Buffer;

  public storage: Record<number, number> = {};

  private _pc: number;

  private running: boolean;

  constructor(public buffer: Buffer, private context: TxContext) {
    this.memory = Buffer.alloc(2048, 0);
    this._pc = 0;
    this.running = true;
  }

  public step(): boolean {
    if (!this.isRunning) {
      return false;
    }
    if (this.pc < 0) {
      throw new InvalidPc('Negative PC');
    }

    const opcode = this.loadOpcode({ opcode: this.buffer[this.pc] });
    opcode.onExecute({
      evm: this,
      byteIndex: this.pc,
      context: this.context,
    });
    this._pc += opcode.length;

    return true;
  }

  public execute() {
    while (this.isRunning) {
      this.step();
    }

    return this;
  }

  private loadOpcode({ opcode: opcodeNumber }: { opcode: number }): OpCode {
    const opcode = opcodes[opcodeNumber];
    if (!opcode) {
      throw new Error(`0x${opcodeNumber.toString(16)}`);
    }
    return opcode;
  }

  public setPc(pc: number) {
    this._pc = pc;
  }

  public stop() {
    this.running = false;
  }

  public get pc() {
    return this._pc;
  }

  public get isRunning() {
    return this.pc < this.buffer.length && this.running;
  }
}

interface TxContext {
  value: Wei;
}

export interface EvmContext {
  evm: Evm;
  byteIndex: number;
  context: TxContext;
}
