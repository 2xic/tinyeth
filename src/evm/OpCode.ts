import { Evm } from './Evm';

export class OpCode {
	constructor(
    public length: number,
    public onExecute: ({
    	evm,
    	byteIndex,
    }: {
      evm: Evm;
      byteIndex: number;
    }) => void
	) {}
}
