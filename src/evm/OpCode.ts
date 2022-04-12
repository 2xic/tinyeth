import { EvmContext } from './Evm';

export class OpCode {
  constructor(
    public length: number,
    public onExecute: (context: EvmContext) => void
  ) {}
}
