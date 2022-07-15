import { UnimplementedOpcode } from './errors/UnimplementedOpcode';
import { EvmContextWithSelfReference } from './interfaceEvm';

export class OpCode {
  constructor(
    private options: {
      name: string;
      arguments: number;
      onExecute?: (
        context: EvmContextWithSelfReference,
        opcode: OpCode
      ) => ExecutionResults | void;
      gasCost: number | (() => number);
    }
  ) {}

  public execute(context: EvmContextWithSelfReference) {
    if (!this.options.onExecute) {
      throw new UnimplementedOpcode(this.mnemonic);
    }
    return this.options.onExecute(context, this);
  }

  public get length() {
    return this.options.arguments;
  }

  public get mnemonic() {
    return this.options.name;
  }

  public get gasCost() {
    const gas = this.options.gasCost;
    if (typeof gas === 'number') {
      return gas;
    }
    return gas();
  }
}

export interface ExecutionResults {
  setPc: boolean;
  computedGas: number;
}
