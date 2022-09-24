import { EvmStack } from './EvmStack';
import { InvalidPc } from './errors/InvalidPc';
import { ExecutionResults, OpCode } from './OpCode';
import { Opcodes } from './Opcodes';
import { Wei } from './eth-units/Wei';
import { Network } from './Network';
import BigNumber from 'bignumber.js';
import {
  calculateDataGasCost,
  GAS_BASE_COST,
} from './gas/calculateDataGasCost';
import { EvmMemory } from './EvmMemory';
import { injectable } from 'inversify';
import { GasComputer } from './gas/GasComputer';
import { EvmStorage } from './EvmStorage';
import { AccessSets } from './gas/AccessSets';
import { Address } from './Address';
import { EvmSubContext } from './EvmSubContext';
import { EvmSubContextCall } from './EvmSubContextCall';
import { Logger } from '../utils/Logger';
import { EvmAccountState } from './EvmAccountState';
import {
  DebugOptions,
  EvmBootOptions,
  EvmContext,
  InterfaceEvm,
} from './interfaceEvm';
import { EvmErrorTrace } from './EvmErrorTrace';

@injectable()
export class Evm implements InterfaceEvm {
  constructor(
    protected stack: EvmStack,
    protected network: Network,
    public memory: EvmMemory,
    public storage: EvmStorage,
    protected gasComputer: GasComputer,
    protected accessSets: AccessSets,
    protected subContext: EvmSubContext,
    protected evmSubContextCall: EvmSubContextCall,
    protected evmAccountState: EvmAccountState,
    protected evmErrorTrace: EvmErrorTrace,
    protected logger: Logger
  ) {}

  private running = false;
  private _gasCost = 0;
  private _gasLeft: BigNumber = new BigNumber(0);

  private _pc = 0;
  private _lastPc = -1;
  private _callingContextReturnData?: Buffer;
  public program: Buffer = Buffer.alloc(0);
  private context!: TxContext;
  private options?: DebugOptions;

  private _isSubContext = false;

  public gasCost(): number {
    return this._gasCost;
  }

  public boot({
    program,
    context,
    options,
    isFork,
    isSubContext,
  }: EvmBootOptions) {
    this.program = program;
    this.context = context;
    this.options = options;
    this._isSubContext = isSubContext || false;
    this._gasCost = isFork
      ? 0
      : GAS_BASE_COST + calculateDataGasCost(context.data);
    this._gasLeft = context.gasLimit.minus(this._gasCost);
    this.resetPc();

    return this;
  }

  public resetPc() {
    this._pc = 0;
    this._lastPc = -1;
    this.running = true;
    this._callingContextReturnData = undefined;
  }

  public async step(): Promise<boolean> {
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
    const prevGas = this.gasCost();
    this.logger.log(
      `Running ${Opcodes[opcodeNumber].mnemonic} (pc: 0x${this.pc.toString(
        16
      )})`
    );

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
    let results: ExecutionResults | void;
    try {
      results = await opcode.execute({
        ...evmContext,
        evmContext,
      });
    } catch (err) {
      this.evmErrorTrace.printState({
        evmContext,
      });
      throw err;
    }

    const gasCost = opcode.computeGasCost({
      ...evmContext,
      evmContext,
    });

    this._gasCost += gasCost;
    this._gasLeft = this._gasLeft.minus(gasCost);

    let updatedPc = false;
    if (results) {
      if (results.computedGas) {
        this._gasCost += results.computedGas;
      }
      updatedPc = results.setPc;
    }

    if (!updatedPc) {
      this.setPc(this._pc + opcode.length);
    }

    if (this.options?.debug) {
      this.logger.log(
        `${
          this.gasCost() - prevGas
        } (${this.gasCost()}) gas used after opcode ${
          Opcodes[opcodeNumber].mnemonic
        }`
      );
      this.logger.log(this.memory.raw.toString('hex') || 'empty memory');
      this.logger.log(this.stack.toString() || []);
    }

    return true;
  }

  public async execute(options?: { stopAtOpcode?: number; stopAtPc?: number }) {
    while (this.isRunning) {
      await this.step();
      if (options?.stopAtOpcode == this.currentOpcodeNumber) {
        break;
      } else if (options?.stopAtPc === this.pc) {
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
    const opcode = Opcodes[opcodeNumber];
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
    return this._gasCost;
  }

  public get gasLeft() {
    return this._gasLeft;
  }

  public get isSubContext(): boolean {
    return this._isSubContext;
  }
}

export interface TxContext {
  value: Wei;
  data: Buffer;
  nonce: number;
  sender: Address;
  receiver: Address;
  gasLimit: BigNumber;
}
