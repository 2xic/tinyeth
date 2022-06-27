import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { Contract } from './Contract';
import { CreateOpCodeWIthVariableArgumentLength } from './CreateOpCodeWIthVariableArgumentLength';
import { InvalidJump } from './errors/InvalidJump';
import { Reverted } from './errors/Reverted';
import { Evm } from './Evm';
import { ExecutionResults, OpCode } from './OpCode';

const JUMP_DEST = 0x5b;

export const opcodes: Record<number, OpCode> = {
  0x0: new OpCode({
    name: 'STOP',
    arguments: 0,
    onExecute: ({ evm }) => {
      evm.stop();
    },
    gasCost: 0,
  }),
  0x1: new OpCode({
    name: 'ADD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(a + b);
    },
    gasCost: 3,
  }),
  0x2: new OpCode({
    name: 'MUL',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(a * b);
    },
    gasCost: 5,
  }),
  0x3: new OpCode({
    name: 'SUB',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(a - b);
    },
    gasCost: 3,
  }),
  0x4: new OpCode({
    name: 'DIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(Math.floor(a / b));
    },
    gasCost: 5,
  }),
  0x5: new OpCode({
    name: 'SDIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(Math.floor(a / b));
    },
    gasCost: 5,
  }),
  0x6: new OpCode({
    name: 'MOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(a % b);
    },
    gasCost: 5,
  }),
  0x7: new OpCode({
    name: 'SMOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      throw new Error('Not implemented');
    },
    gasCost: 5,
  }),
  0x8: new OpCode({
    name: 'ADDMOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      const c = stack.pop().toNumber();
      const newLocal = a.plus(b).modulo(new BigNumber(2).pow(256));

      stack.push(newLocal.toNumber() % c);
    },
    gasCost: 8,
  }),
  0x9: new OpCode({
    name: 'MULMOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      const c = stack.pop();
      const newLocal = a.multipliedBy(b);

      stack.push(newLocal.mod(c));
    },
    gasCost: 8,
  }),
  0x0a: new OpCode({
    name: 'EXP',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(Math.pow(a, b));

      return {
        setPc: false,
        computedGas: 10 + (b.toString(2).length - 1) * 50,
      };
    },
    gasCost: 0,
  }),
  0x14: new OpCode({
    name: 'EQ',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();

      stack.push(Number(a === b));
    },
    gasCost: 3,
  }),
  0x15: new OpCode({
    name: 'ISZERO',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();

      stack.push(Number(a === 0));
    },
    gasCost: 3,
  }),
  0x18: new OpCode({
    name: 'XOR',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(a ^ b);
    },
    gasCost: 3,
  }),
  0x39: new OpCode({
    name: 'CODECOPY',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const destOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      for (let i = 0; i < size; i++) {
        memory.memory[destOffset + i] = evm.program[offset + i];
      }
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x50: new OpCode({
    name: 'POP',
    arguments: 1,
    onExecute: ({ stack }) => {
      stack.pop();
    },
    gasCost: 2,
  }),
  0x55: new OpCode({
    name: 'SSTORE',
    arguments: 1,
    onExecute: ({ stack, gasComputer, storage }): ExecutionResults => {
      const key = stack.pop();
      const value = stack.pop();
      const gas = gasComputer.sstore({
        gasLeft: 10_000, //evm.gasLeft,
        address: '0xdeadbeef',
        key,
        value,
      });

      storage.write({ key, value });
      return {
        setPc: false,
        // not sure if this is correct, If I recall correctly gas refund is done at the end of the transaction.
        computedGas: gas.gasCost - gas.gasRefund,
      };
    },
    gasCost: () => 0,
  }),
  ...CreateOpCodeWIthVariableArgumentLength({
    fromOpcode: 0x60,
    toOpcode: 0x7f,
    baseName: 'PUSH',
    arguments: (index) => index + 1,
    iteratedExecuteConstruction:
      (index) =>
      ({ evm, stack }) => {
        const value = readEvmBuffer(evm, 1, index);
        stack.push(value);
      },
    gasCost: 3,
  }),
  ...CreateOpCodeWIthVariableArgumentLength({
    fromOpcode: 0x80,
    toOpcode: 0x8f,
    baseName: 'DUP',
    arguments: 1,
    iteratedExecuteConstruction:
      (index) =>
      ({ stack }) => {
        if (index === 1) {
          stack.push(stack.get(-1));
        } else {
          stack.push(stack.get(stack.length - index));
        }
      },
    gasCost: 3,
  }),
  ...CreateOpCodeWIthVariableArgumentLength({
    fromOpcode: 0x90,
    toOpcode: 0x9f,
    baseName: 'SWAP',
    arguments: 1,
    iteratedExecuteConstruction:
      (index) =>
      ({ stack }) => {
        stack.swap(0, index);
      },
    gasCost: 3,
  }),
  0x31: new OpCode({
    name: 'BALANCE',
    arguments: 1,
    onExecute: ({ stack, gasComputer, accessSets }) => {
      const address = stack.pop();
      // TODO : add some proper account balancing
      stack.push(new BigNumber(42));
      const gasComputed = gasComputer.account({
        address,
      });
      accessSets.touchAddress({
        address,
      });
      return {
        computedGas: gasComputed.gasCost,
        setPc: false,
      };
    },
    gasCost: 0,
  }),
  0x34: new OpCode({
    name: 'CALLVALUE',
    arguments: 1,
    onExecute: ({ stack, context }) => {
      stack.push(context.value.value);
    },
    gasCost: 2,
  }),
  0x35: new OpCode({
    name: 'CALLDATALOAD',
    arguments: 1,
    onExecute: ({ context, stack }) => {
      const index = stack.pop().toNumber();
      stack.push(
        parseInt(context.data.slice(index, index + 32).toString('hex'), 16)
      );
    },
    gasCost: () => 1,
  }),
  0x36: new OpCode({
    name: 'CALLDATASIZE',
    arguments: 1,
    onExecute: ({ stack, context }) => {
      stack.push(context.data.length);
    },
    gasCost: 3,
  }),
  0x37: new OpCode({
    name: 'CALLDATACOPY',
    arguments: 1,
    onExecute: ({ stack, memory, context }) => {
      const dataOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      for (let i = 0; i < length; i++) {
        memory.memory[dataOffset + i] = context.data[offset + i];
      }
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x38: new OpCode({
    name: 'CODESIZE',
    arguments: 1,
    onExecute: ({ evm, stack }) => {
      stack.push(evm.program.length);
    },
    gasCost: 2,
  }),
  0x3b: new OpCode({
    name: 'EXTCODESIZE',
    arguments: 1,
    onExecute: ({ stack, network }) => {
      const stackItem = stack.pop();
      const addr = stackItem.toString(16);
      const contract = network.get(addr);
      stack.push(contract.length);
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a5-balance-extcodesize-extcodehash
    gasCost: () => 1,
  }),
  0x52: new OpCode({
    name: 'MSTORE',
    arguments: 1,
    onExecute: ({ stack, memory, gasComputer }) => {
      const offset = stack.pop().toNumber();
      const value = stack.pop();

      const uint = Buffer.from(
        new Uint({
          input: value,
          n: 256,
        }).value.encoding,
        'hex'
      );

      for (let i = 0; i < 32; i++) {
        memory.memory[offset + i] = uint[i];
      }
      const computedGas = gasComputer.memoryExpansion({
        address: new BigNumber(offset + 32),
      });

      return {
        computedGas: computedGas.gasCost,
        setPc: false,
      };
    },
    gasCost: () => 3,
  }),
  0x56: new OpCode({
    name: 'JUMP',
    arguments: 1,
    onExecute: ({ evm, stack }) => {
      const pc = stack.pop().toNumber();
      const opcode = evm.program[pc] == JUMP_DEST;
      if (!opcode) {
        throw new InvalidJump();
      }
      evm.setPc(pc);
      return {
        setPc: true,
        computedGas: 0,
      };
    },
    gasCost: 8,
  }),
  0x57: new OpCode({
    name: 'JUMPI',
    arguments: 1,
    onExecute: ({ evm, stack }) => {
      const pc = stack.pop().toNumber();
      const condition = stack.pop();

      if (condition.isEqualTo(1)) {
        const opcode = evm.program[pc] == JUMP_DEST;
        if (!opcode) {
          throw new InvalidJump();
        }
        evm.setPc(pc);
        return {
          setPc: true,
          computedGas: 0,
        };
      }
    },
    gasCost: 10,
  }),
  0x5b: new OpCode({
    name: 'JUMPDEST',
    arguments: 1,
    onExecute: () => {
      // Just metadata
    },
    gasCost: 1,
  }),
  0xf0: new OpCode({
    name: 'CREATE',
    arguments: 1,
    onExecute: ({ stack, memory, network }) => {
      const value = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      const contractBytes = memory.memory.slice(offset, offset + length);
      const contract = new Contract(
        contractBytes,
        new BigNumber(value)
      ).execute();

      network.register({ contract });
      stack.push(new BigNumber(contract.address, 16));
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a9-create-operations
    gasCost: () => 1,
  }),
  0xf3: new OpCode({
    name: 'RETURN',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      evm.setCallingContextReturnData(
        memory.memory.slice(offset, offset + size)
      );
    },
    // TOdo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
  0xfd: new OpCode({
    name: 'REVERT',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      evm.setCallingContextReturnData(
        memory.memory.slice(offset, offset + length)
      );

      throw new Reverted('Reverted');
    },
    // TOdo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
};

function readEvmBuffer(evm: Evm, offset: number, length: number) {
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(evm.peekBuffer(offset + i).toNumber());
  }
  return new BigNumber(`0x${Buffer.from(numbers).toString('hex')}`);
}
