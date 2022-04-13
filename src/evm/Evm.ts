import { InvalidatedProjectKind } from 'typescript';
import { EvmStack } from './EvmStack';
import { InvalidPc } from './errors/InvalidPc';
import { OpCode } from './OpCode';
import { opcodes } from './Opcodes';
import { Wei } from './Wei';

export class Evm {
  public stack: EvmStack = new EvmStack();

  public memory!: Buffer;

  public storage: Record<number, number> = {};

  private _pc: number;

  private _lastPc: number;

  private running: boolean;

  constructor(public buffer: Buffer, private context: TxContext) {
    this.memory = Buffer.alloc(2048, 0);
    this._pc = 0;
    this._lastPc = -1;
    this.running = true;
  }

  public step(): boolean {
    if (!this.isRunning) {
      return false;
    }
    if (this.pc < 0) {
      throw new InvalidPc('Negative PC');
    } else if (this.pc === this._lastPc) {
      throw new InvalidPc(
        `Program counter is stuck ${this.currentOpcodeNumber.toString(16)}`
      );
    }

    const opcode = this.loadOpcode();

    const results = opcode.onExecute({
      evm: this,
      byteIndex: this.pc,
      context: this.context,
    });

    if (!results) {
      this.setPc(this._pc + opcode.length);
    }

    return true;
  }

  public execute() {
    while (this.isRunning) {
      this.step();
    }

    return this;
  }

  private get currentOpcodeNumber() {
    return this.buffer[this.pc];
  }

  private loadOpcode(): OpCode {
    const opcodeNumber = this.currentOpcodeNumber;
    const opcode = opcodes[opcodeNumber];
    if (!opcode) {
      throw new Error(`0x${opcodeNumber.toString(16)}`);
    }
    return opcode;
  }

  public peekBuffer(index: number) {
    return this.buffer[this.pc + index];
  }

  public setPc(pc: number) {
    this._lastPc = this._pc;
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
  data: Buffer;
}

export interface EvmContext {
  evm: Evm;
  byteIndex: number;
  context: TxContext;
}
