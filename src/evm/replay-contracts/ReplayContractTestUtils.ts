import BigNumber from 'bignumber.js';
import fs from 'fs';
import { injectable } from 'inversify';
import path from 'path';
import { ExposedEvm } from '../ExposedEvm';
import { Opcodes } from '../Opcodes';

@injectable()
export class ReplayContractTestUtils {
  constructor() {}

  public async replayFile(
    evm: ExposedEvm,
    fullFilePath: string,
    options: { breakpoint?: number }
  ) {
    const fileData: Array<{
      pc: string;
      memory: string;
      stack: string[];
      storage: Record<string, string>;
    }> = JSON.parse(
      // path.join(__dirname, fullFilePath)
      fs.readFileSync(fullFilePath).toString('utf-8')
    );
    let lastStackState: BigNumber[] = [];
    const breakPoint = options.breakpoint;
    for (let index = 1; index < fileData.length; index++) {
      const state = fileData[index];
      lastStackState = evm.stack.raw;
      await evm.step();

      if (evm.pc !== parseInt(state.pc, 16)) {
        throw new Error('Error in pc location');
      }

      const stateStack = state.stack.filter((item) => !!item.length).reverse();

      let stackError = evm.stack.length !== stateStack.length;
      for (let i = 0; i < evm.stack.length && !stackError; i++) {
        stackError =
          evm.stack.get(i).toNumber() !== parseInt(stateStack[i], 16);
        if (stackError) {
          break;
        }
      }

      if (breakPoint === evm.pc) {
        break;
      }

      if (stackError) {
        throw new Error(
          `Error at pc ${state.pc}. Previous opcodes ${
            Opcodes[evm.program[evm.pc - 1]].mnemonic
          }
    
            ${lastStackState.length} ${stateStack.length}
            
            ${lastStackState.map((item) => item.toString(16))}
    
            ${stateStack.map((item) => item.toString())}
            `
        );
      }
    }
  }
}
