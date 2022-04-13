import { EvmContext } from './Evm';

export class OpCode {
  constructor(
    public length: number,
    public onExecute: (context: EvmContext) => ExecutionResults | void
  ) {}
}

interface ExecutionResults {
  setPc: boolean;
}
