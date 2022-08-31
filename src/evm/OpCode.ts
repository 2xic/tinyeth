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
      ) => UnionResults | Promise<UnionResults>;
      gasCost: number | ((context: EvmContextWithSelfReference) => number);
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

  public computeGasCost(context: EvmContextWithSelfReference) {
    const gas = this.options.gasCost;
    if (typeof gas === 'number') {
      return gas;
    }
    return gas(context);
  }
}

export interface ExecutionResults {
  setPc: boolean;
  computedGas: number;
}

type UnionResults = ExecutionResults | void;
