import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { EvmContext } from './interfaceEvm';

@injectable()
export class EvmErrorTrace {
  constructor(private logger: Logger) {}

  public printState({ evmContext }: { evmContext: EvmContext }) {
    const state = [
      `PC: ${evmContext.evm.pc.toString()} / 0x${evmContext.evm.pc.toString(
        16
      )}`,
      `Memory: ${evmContext.memory.raw.toString('hex')}`,
      `Stack items : ${evmContext.stack.length}`,
    ];
    this.logger.log(state.join('\n'));
  }
}
