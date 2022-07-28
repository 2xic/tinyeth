import { Evm } from './Evm';
import { EvmStack } from './EvmStack';
import { ExecutionResults, OpCode } from './OpCode';

export function CreateOpCodeWIthVariableArgumentLength(options: {
  fromOpcode: number;
  toOpcode: number;
  baseName: string;
  gasCost: number;
  iteratedExecuteConstruction: (
    index: number
  ) => ({
    evm,
    stack,
  }: {
    evm: Evm;
    stack: EvmStack;
  }) => void | ExecutionResults;
  arguments: number | ((index: number) => number);
  deltaStart?: number;
}) {
  const record: Record<number, OpCode> = {};
  for (let opcode = options.fromOpcode; opcode <= options.toOpcode; opcode++) {
    const jumpStart =
      typeof options.deltaStart === 'number' ? options.deltaStart : 1;
    const delta = jumpStart + (opcode - options.fromOpcode);
    const opcode_arguments =
      typeof options.arguments == 'number'
        ? options.arguments
        : options.arguments(delta);

    record[opcode] = new OpCode({
      name: `${options.baseName}${delta}`,
      arguments: opcode_arguments,
      gasCost: options.gasCost,
      onExecute: options.iteratedExecuteConstruction(delta),
    });
  }
  return record;
}
