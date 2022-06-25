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
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a + b);
    },
    gasCost: 3,
  }),
  0x2: new OpCode({
    name: 'MUL',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a * b);
    },
    gasCost: 5,
  }),
  0x3: new OpCode({
    name: 'SUB',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a - b);
    },
    gasCost: 3,
  }),
  0x14: new OpCode({
    name: 'EQ',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();

      evm.stack.push(Number(a === b));
    },
    gasCost: 3,
  }),
  0x15: new OpCode({
    name: 'ISZERO',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();

      evm.stack.push(Number(a === 0));
    },
    gasCost: 3,
  }),
  0x18: new OpCode({
    name: 'XOR',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a ^ b);
    },
    gasCost: 3,
  }),
  0x39: new OpCode({
    name: 'CODECOPY',
    arguments: 1,
    onExecute: ({ evm }) => {
      const destOffset = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const size = evm.stack.pop().toNumber();

      for (let i = 0; i < size; i++) {
        evm.storage.memory[destOffset + i] = evm.program[offset + i];
      }
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x50: new OpCode({
    name: 'POP',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.pop();
    },
    gasCost: 2,
  }),
  0x55: new OpCode({
    name: 'SSTORE',
    arguments: 1,
    onExecute: ({ evm }): ExecutionResults => {
      const key = evm.stack.pop();
      const value = evm.stack.pop();
      const gas = evm.gasComputer.sstore({
        gasLeft: 10_000, //evm.gasLeft,
        address: '0xdeadbeef',
        key,
        value,
      });

      evm.storage.storage[key.toString()] = value;
      return {
        setPc: false,
        // not sure if this is correct, If I recall correctly gas refund is done at the end of the transaction.
        computedGas: gas.gasCost - gas.gasRefund,
      };
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a7-sstore
    gasCost: () => 0,
  }),
  ...CreateOpCodeWIthVariableArgumentLength({
    fromOpcode: 0x60,
    toOpcode: 0x7f,
    baseName: 'PUSH',
    arguments: (index) => index + 1,
    iteratedExecuteConstruction:
      (index) =>
      ({ evm }) => {
        const value = readEvmBuffer(evm, 1, index);
        evm.stack.push(value);
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
      ({ evm }) => {
        if (index === 1) {
          evm.stack.push(evm.stack.get(-1));
        } else {
          evm.stack.push(evm.stack.get(evm.stack.length - index));
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
      ({ evm }) => {
        evm.stack.swap(0, index);
      },
    gasCost: 3,
  }),
  0x34: new OpCode({
    name: 'CALLVALUE',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      evm.stack.push(context.value.value);
    },
    gasCost: 2,
  }),
  0x35: new OpCode({
    name: 'CALLDATALOAD',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      const index = evm.stack.pop().toNumber();
      evm.stack.push(
        parseInt(context.data.slice(index, index + 32).toString('hex'), 16)
      );
    },
    gasCost: () => 1,
  }),
  0x36: new OpCode({
    name: 'CALLDATASIZE',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      evm.stack.push(context.data.length);
    },
    gasCost: 3,
  }),
  0x37: new OpCode({
    name: 'CALLDATACOPY',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      const dataOffset = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      for (let i = 0; i < length; i++) {
        evm.storage.memory[dataOffset + i] = context.data[offset + i];
      }
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x38: new OpCode({
    name: 'CODESIZE',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.push(evm.program.length);
    },
    gasCost: 2,
  }),
  0x3b: new OpCode({
    name: 'EXTCODESIZE',
    arguments: 1,
    onExecute: ({ evm }) => {
      const stackItem = evm.stack.pop();
      const addr = stackItem.toString(16);
      const contract = evm.network.get(addr);
      evm.stack.push(contract.length);
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a5-balance-extcodesize-extcodehash
    gasCost: () => 1,
  }),
  0x52: new OpCode({
    name: 'MSTORE',
    arguments: 1,
    onExecute: ({ evm }) => {
      const offset = evm.stack.pop().toNumber();
      const value = evm.stack.pop();

      const uint = Buffer.from(
        new Uint({
          input: value,
          n: 256,
        }).value.encoding,
        'hex'
      );

      for (let i = 0; i < 32; i++) {
        evm.storage.memory[offset + i] = uint[i];
      }
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
  0x56: new OpCode({
    name: 'JUMP',
    arguments: 1,
    onExecute: ({ evm }) => {
      const pc = evm.stack.pop().toNumber();
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
    onExecute: ({ evm }) => {
      const pc = evm.stack.pop().toNumber();
      const condition = evm.stack.pop();

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
    onExecute: ({ evm }) => {
      const value = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      const contractBytes = evm.storage.memory.slice(offset, offset + length);
      const contract = new Contract(
        contractBytes,
        new BigNumber(value)
      ).execute();

      evm.network.register({ contract });
      evm.stack.push(new BigNumber(contract.address, 16));
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a9-create-operations
    gasCost: () => 1,
  }),
  0xf3: new OpCode({
    name: 'RETURN',
    arguments: 1,
    onExecute: ({ evm }) => {
      const offset = evm.stack.pop().toNumber();
      const size = evm.stack.pop().toNumber();

      evm.setCallingContextReturnData(
        evm.storage.memory.slice(offset, offset + size)
      );
    },
    // TOdo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
  0xfd: new OpCode({
    name: 'REVERT',
    arguments: 1,
    onExecute: ({ evm }) => {
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      evm.setCallingContextReturnData(
        evm.storage.memory.slice(offset, offset + length)
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
