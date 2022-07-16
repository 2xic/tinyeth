import { injectable } from 'inversify';
import { EvmContext } from './interfaceEvm';

@injectable()
export class EvmErrorTrace {
  public printState({ evmContext }: { evmContext: EvmContext }) {
    const state = [
      `PC: ${evmContext.evm.pc.toString()} / 0x${evmContext.evm.pc.toString(
        16
      )}`,
      `Memory: ${evmContext.memory.raw.toString('hex')}`,
      `Stack items : ${evmContext.stack.length}`,
    ];
    // eslint-disable-next-line no-console
    console.log(state.join('\n'));
  }
}
