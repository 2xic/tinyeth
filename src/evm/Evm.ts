import { EvmStack } from './EvmStack';
import { InvalidPc } from './errors/InvalidPc';
import { OpCode } from './OpCode';
import { opcodes } from './Opcodes';
import { Wei } from './Wei';
import { Network } from './Network';
import BigNumber from 'bignumber.js';
import { calculateDataGasCost, GAS_BASE_COST } from './gas/Gas';
import { EvmMemory } from './EvmMemory';
import { injectable } from 'inversify';
import { GasComputer } from './gas/GasComputer';
import { EvmKeyValueStorage } from './EvmKeyValueStorage';
import { AccessSets } from './gas/AccessSets';
import { Address } from './Address';
import { EvmSubContext } from './EvmSubContext';
import { EvmSubContextCall } from './EvmSubContextCall';
import { Logger } from '../utils/Logger';
import { EvmAccountState } from './EvmAccountState';
import { DebugOptions, EvmBootOptions, EvmContext } from './interfaceEvm';

@injectable()
export class Evm {
  constructor(
    protected stack: EvmStack,
    protected network: Network,
    protected memory: EvmMemory,
    protected storage: EvmKeyValueStorage,
    protected gasComputer: GasComputer,
    protected accessSets: AccessSets,
    protected subContext: EvmSubContext,
    protected evmSubContextCall: EvmSubContextCall,
    protected evmAccountState: EvmAccountState,
    protected logger: Logger
  ) {}

  private running = false;
  private gasCost = 0;
  private _gasLeft: BigNumber = new BigNumber(0);

  private _pc = 0;
  private _lastPc = -1;
  private _callingContextReturnData?: Buffer;
  public program: Buffer = Buffer.alloc(0);
  private context!: TxContext;
  private options?: DebugOptions;

  public boot({ program, context, options }: EvmBootOptions) {
    this.program = program;
    this.context = context;
    this.options = options;
    this._pc = 0;
    this._lastPc = -1;
    this.gasCost = GAS_BASE_COST + calculateDataGasCost(context.data);
    this._gasLeft = context.gasLimit.minus(this.gasCost);
    this.running = true;

    this.logger.log(JSON.stringify(context));

    return this;
  }

  public step(): boolean {
    if (!this.isRunning || !this.context) {
      return false;
    }
    if (this.pc < 0) {
      throw new InvalidPc('Negative PC');
    } else if (this.pc === this._lastPc) {
      throw new InvalidPc(
        `Program counter is stuck ${this.currentOpcodeNumber.toString(16)}`
      );
    }

    const { opcode, opcodeNumber } = this.loadOpcode();
    this.logger.log(`Running ${opcodes[opcodeNumber].mnemonic}`);
    const evmContext: EvmContext = {
      evm: this,
      stack: this.stack,
      network: this.network,
      storage: this.storage,
      memory: this.memory,
      gasComputer: this.gasComputer,
      accessSets: this.accessSets,
      byteIndex: this.pc,
      context: this.context,
      subContext: this.subContext,
      evmSubContextCall: this.evmSubContextCall,
      evmAccountState: this.evmAccountState,
    };
    const results = opcode.execute({
      ...evmContext,
      evmContext,
    });
    this.gasCost += opcode.gasCost;
    this._gasLeft = this._gasLeft.minus(opcode.gasCost);

    let updatedPc = false;
    if (results) {
      if (results.computedGas) {
        this.gasCost += results.computedGas;
      }
      updatedPc = results.setPc;
    }

    if (!updatedPc) {
      this.setPc(this._pc + opcode.length);
    }

    if (this.options?.debug) {
      this.logger.log(this.memory.raw.toString('hex') || 'empty memory');
      this.logger.log(this.stack.toString() || []);
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

  private loadOpcode(): { opcode: OpCode; opcodeNumber: number } {
    const opcodeNumber = this.currentOpcodeNumber;
    const opcode = opcodes[opcodeNumber];
    if (!opcode) {
      throw new Error(`0x${opcodeNumber.toString(16)}`);
    }
    return {
      opcode,
      opcodeNumber,
    };
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

  public get totalGasCost() {
    return this.gasCost;
  }

  public get gasLeft() {
    return this._gasLeft;
  }
}

export interface TxContext {
  value: Wei;
  data: Buffer;
  nonce: number;
  sender: Address;
  gasLimit: BigNumber;

  /* 
    Todo 
    - Caller should be added here also.
      This affect the access sets for instance.
  */
}
