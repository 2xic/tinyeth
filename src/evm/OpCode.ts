import { UnimplementedOpcode } from './errors/UnimplementedOpcode';
import { EvmContext } from './Evm';

export class OpCode {
  constructor(
    private options: {
      name: string;
      arguments: number;
      onExecute?: (context: EvmContext) => ExecutionResults | void;
      gasCost: number | (() => number);
    }
  ) {}

  public execute(context: EvmContext) {
    if (!this.options.onExecute) {
      throw new UnimplementedOpcode(this.mnemonic);
    }
    return this.options.onExecute(context);
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
