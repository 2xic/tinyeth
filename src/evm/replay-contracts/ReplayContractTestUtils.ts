import BigNumber from 'bignumber.js';
import fs from 'fs';
import { injectable } from 'inversify';
import { ExposedEvm } from '../ExposedEvm';
import { Opcodes } from '../Opcodes';

@injectable()
export class ReplayContractTestUtils {
  public async replayFile(
    evm: ExposedEvm,
    fullFilePath: string,
    options: { breakpoint?: number }
  ) {
    const fileData: Array<State> = JSON.parse(
      // path.join(__dirname, fullFilePath)
      fs.readFileSync(fullFilePath).toString('utf-8')
    );
    let lastStackState: BigNumber[] = [];
    const breakPoint = options.breakpoint;
    let previousPc = -1;
    for (let index = 1; index < fileData.length; index++) {
      const state = fileData[index];
      lastStackState = [...evm.stack.raw];
      previousPc = evm.pc;

      await evm.step();

      const isFinished = !state.pc && !evm.isRunning;

      if (!isFinished && evm.pc !== parseInt(state.pc, 16)) {
        throw new Error(
          `
          Error in pc location 0x${evm.pc.toString(16)} vs 0x${state.pc}. 
          \n
          Previous pc 0x${previousPc.toString(16)} vs 0x${
            fileData[index - 1].pc
          }
          Previous opcode ${Opcodes[evm.program[previousPc]].mnemonic}

          is evm running ? ${evm.isRunning}
          `
        );
      }

      if (breakPoint === evm.pc) {
        break;
      }

      this.verifyStack({
        state,
        evm,
        lastStackState,
        previousPc,
      });

      this.verifyMemory({
        state,
        evm,
        previousPc,
        lastStackState,
      });

      this.verifyStorage({
        state,
        evm,
        lastStackState,
        previousPc,
      });
    }
  }

  private verifyStack({
    state,
    evm,
    lastStackState,
    previousPc,
  }: {
    state: State;
    evm: ExposedEvm;
    lastStackState: BigNumber[];
    previousPc: number;
  }) {
    const stateStack = state.stack.filter((item) => !!item.length).reverse();

    let stackError = evm.stack.length !== stateStack.length;

    for (let i = 0; i < evm.stack.length && !stackError; i++) {
      stackError = evm.stack.get(i).toNumber() !== parseInt(stateStack[i], 16);
      if (stackError) {
        break;
      }
    }
    const { opcode, opcodeArguments } = this.getPreviousOpcodeAndArguments({
      evm,
      previousPc,
      lastStackState,
    });

    if (stackError) {
      throw new Error(
        `Error at pc ${state.pc}. Previous opcodes ${opcode} ${opcodeArguments}

          ${lastStackState.length} ${stateStack.length}
          
          Truth  
          ${stateStack.map((item) => item.toString())}

          Our EVM
          ${lastStackState.map((item) => item.toString(16))}
          `
      );
    }
  }

  private verifyStorage({
    state,
    evm,
    lastStackState,
    previousPc,
  }: {
    state: State;
    evm: ExposedEvm;
    lastStackState: BigNumber[];
    previousPc: number;
  }) {
    const sameLength =
      Object.entries(state.storage).length ===
      Object.entries(evm.storage.storage).length;
    const sameKeyValues = Object.entries(state.storage).every(
      ([key, value]) =>
        evm.storage.storage[key] &&
        evm.storage.storage[key].toString(16) === value
    );
    const isError = !sameLength || !sameKeyValues;

    const { opcode, opcodeArguments } = this.getPreviousOpcodeAndArguments({
      evm,
      previousPc,
      lastStackState,
    });

    if (isError) {
      throw new Error(
        `Error at pc ${
          state.pc
        }. Previous opcodes ${opcode} Arguments : ${opcodeArguments}

          ${lastStackState.map((item) => item.toString(16))}

          Truth
          ${Object.entries(state.storage).map((item) => [item[0], item[1]])}

          Our EVM
          ${Object.entries(evm.storage.storage).map((item) => [
            item[0],
            item[1],
          ])}
          `
      );
    }
  }

  private verifyMemory({
    state,
    evm,
    previousPc,
    lastStackState,
  }: {
    state: State;
    evm: ExposedEvm;
    previousPc: number;
    lastStackState: BigNumber[];
  }) {
    const sameLength =
      state.memory.length === evm.memory.raw.toString('hex').length;
    const sameValues = [...state.memory].every((item, index) => {
      return evm.memory.raw.toString('hex')[index] == item;
    });
    const isError = !sameLength || !sameValues;
    const { opcode, opcodeArguments } = this.getPreviousOpcodeAndArguments({
      evm,
      previousPc,
      lastStackState,
    });

    if (isError) {
      throw new Error(`Error at pc ${
        state.pc
      }. Previous opcodes ${opcode} Arguments : ${opcodeArguments}

          Truth
          ${state.memory}

          Our evm
          ${evm.memory.raw.toString('hex')}
      `);
    }
  }

  private getPreviousOpcodeAndArguments({
    evm,
    previousPc,
    lastStackState,
  }: {
    evm: ExposedEvm;
    previousPc: number;
    lastStackState: BigNumber[];
  }) {
    const opcode = Opcodes[evm.program[previousPc]];
    return {
      opcode: opcode.mnemonic,
      opcodeArguments: lastStackState
        .slice(lastStackState.length - opcode.length - 1, lastStackState.length)
        .map((item) => item.toString(16))
        .join(', '),
    };
  }
}

interface State {
  pc: string;
  memory: string;
  stack: string[];
  storage: Record<string, string>;
}
