import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { EvmContext } from './interfaceEvm';
import { Opcodes } from './Opcodes';

@injectable()
export class EvmErrorTrace {
  constructor(private logger: Logger) {}

  public printState({ evmContext }: { evmContext: EvmContext }) {
    const state = [
      `PC: ${evmContext.evm.pc.toString()} / 0x${evmContext.evm.pc.toString(
        16
      )}`,
      `Opcode: ${Opcodes[evmContext.evm.program[evmContext.evm.pc]].mnemonic}`,
      `Memory: ${evmContext.memory.raw.toString('hex')}`,
      `Stack items : ${evmContext.stack.length}`,
    ];
    this.logger.log(state.join('\n'));
  }
}
