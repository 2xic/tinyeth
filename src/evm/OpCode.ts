import { EvmContext } from './Evm';

export class OpCode {
  constructor(
    private options: {
      name: string;
      arguments: number;
      onExecute: (context: EvmContext) => ExecutionResults | void;
      gasCost: () => number;
    }
  ) {}

  public execute(context: EvmContext) {
    return this.options.onExecute(context);
  }

  public get length() {
    return this.options.arguments;
  }
}

interface ExecutionResults {
  setPc: boolean;
}
