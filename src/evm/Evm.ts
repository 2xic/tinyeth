import { EvmStack } from './EvmStack';
import { InvalidPc } from './errors/InvalidPc';
import { OpCode } from './OpCode';
import { opcodes } from './Opcodes';
import { Wei } from './Wei';
import { Network } from './Network';
import BigNumber from 'bignumber.js';

export class Evm {
  public stack: EvmStack = new EvmStack();

  public network: Network = new Network();

  public memory!: Buffer;

  public storage: Record<string, BigNumber> = {};

  private _pc: number;

  private _lastPc: number;

  private running: boolean;
  private _callingContextReturnData?: Buffer;

  constructor(public program: Buffer, private context: TxContext) {
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

  public execute(options?: { stopAtOpcode?: number }) {
    while (this.isRunning) {
      this.step();
      if (options?.stopAtOpcode == this.currentOpcodeNumber) {
        break;
      }
    }

    return this;
  }

  private get currentOpcodeNumber() {
    return this.program[this.pc];
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
    return new BigNumber(this.program[this.pc + index]);
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
    return (
      this.pc < this.program.length &&
      this.running &&
      !this.callingContextReturnData
    );
  }

  public setCallingContextReturnData(buffer: Buffer) {
    this._callingContextReturnData = buffer;
  }

  public get callingContextReturnData() {
    return this._callingContextReturnData;
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
