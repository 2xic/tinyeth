import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { Contract } from './Contract';
import { InvalidJump } from './errors/InvalidJump';
import { Reverted } from './errors/Reverted';
import { Evm } from './Evm';
import { OpCode } from './OpCode';

const JUMP_DEST = 0x5b;

export const opcodes: Record<number, OpCode> = {
  0x0: new OpCode({
    name: 'STOP',
    arguments: 0,
    onExecute: ({ evm }) => {
      evm.stop();
    },
    gasCost: () => 1,
  }),
  0x2: new OpCode({
    name: 'MUL',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a * b);
    },
    gasCost: () => 1,
  }),
  0x1: new OpCode({
    name: 'ADD',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a + b);
    },
    gasCost: () => 1,
  }),
  0x3: new OpCode({
    name: 'SUB',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a - b);
    },
    gasCost: () => 1,
  }),
  0x14: new OpCode({
    name: 'EQ',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();

      evm.stack.push(Number(a === b));
    },
    gasCost: () => 1,
  }),
  0x15: new OpCode({
    name: 'ISZERO',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();

      evm.stack.push(Number(a === 0));
    },
    gasCost: () => 1,
  }),
  0x18: new OpCode({
    name: 'XOR',
    arguments: 1,
    onExecute: ({ evm }) => {
      const a = evm.stack.pop().toNumber();
      const b = evm.stack.pop().toNumber();
      evm.stack.push(a ^ b);
    },
    gasCost: () => 1,
  }),
  0x39: new OpCode({
    name: 'CODECOPY',
    arguments: 1,
    onExecute: ({ evm }) => {
      const destOffset = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const size = evm.stack.pop().toNumber();

      for (let i = 0; i < size; i++) {
        evm.memory[destOffset + i] = evm.program[offset + i];
      }
    },
    gasCost: () => 1,
  }),
  0x50: new OpCode({
    name: 'POP',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.pop();
    },
    gasCost: () => 1,
  }),
  0x55: new OpCode({
    name: 'SSTORAGE',
    arguments: 1,
    onExecute: ({ evm }) => {
      const key = evm.stack.pop();
      const value = evm.stack.pop();

      evm.storage[key.toString()] = value;
    },
    gasCost: () => 1,
  }),
  0x60: new OpCode({
    name: 'PUSH1',
    arguments: 2,
    onExecute: ({ evm }) => {
      evm.stack.push(evm.peekBuffer(1));
    },
    gasCost: () => 1,
  }),
  0x61: new OpCode({
    name: 'PUSH2',
    arguments: 3,
    onExecute: ({ evm }) => {
      const value = readEvmBuffer(evm, 1, 2);
      evm.stack.push(value);
    },
    gasCost: () => 1,
  }),
  0x6c: new OpCode({
    name: 'PUSH13',
    arguments: 14,
    onExecute: ({ evm }) => {
      const value = readEvmBuffer(evm, 1, 13);
      evm.stack.push(value);
    },
    gasCost: () => 1,
  }),
  0x7f: new OpCode({
    name: 'PUSH32',
    arguments: 33,
    onExecute: ({ evm }) => {
      const value = readEvmBuffer(evm, 1, 32);
      evm.stack.push(value);
    },
    gasCost: () => 1,
  }),
  0x80: new OpCode({
    name: 'DUP1',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.push(evm.stack.get(-1));
    },
    gasCost: () => 1,
  }),
  0x81: new OpCode({
    name: 'DUP2',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.push(evm.stack.get(evm.stack.length - 2));
    },
    gasCost: () => 1,
  }),
  0x90: new OpCode({
    name: 'SWAP1',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.swap(0, 1);
    },
    gasCost: () => 1,
  }),
  0x94: new OpCode({
    name: 'SWAP6',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.swap(0, 5);
    },
    gasCost: () => 1,
  }),
  0x34: new OpCode({
    name: 'CALLVALUE',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      evm.stack.push(context.value.value);
    },
    gasCost: () => 1,
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
    gasCost: () => 1,
  }),
  0x37: new OpCode({
    name: 'CALLDATACOPY',
    arguments: 1,
    onExecute: ({ evm, context }) => {
      const dataOffset = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      for (let i = 0; i < length; i++) {
        evm.memory[dataOffset + i] = context.data[offset + i];
      }
    },
    gasCost: () => 1,
  }),
  0x38: new OpCode({
    name: 'CODESIZE',
    arguments: 1,
    onExecute: ({ evm }) => {
      evm.stack.push(evm.program.length);
    },
    gasCost: () => 1,
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
        evm.memory[offset + i] = uint[i];
      }
    },
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
      };
    },
    gasCost: () => 1,
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
        };
      }
    },
    gasCost: () => 1,
  }),
  0x5b: new OpCode({
    name: 'JUMPDEST',
    arguments: 1,
    onExecute: () => {
      // Just metadata
    },
    gasCost: () => 1,
  }),
  0xf0: new OpCode({
    name: 'CREATE',
    arguments: 1,
    onExecute: ({ evm }) => {
      const value = evm.stack.pop().toNumber();
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      const contractBytes = evm.memory.slice(offset, offset + length);
      const contract = new Contract(
        contractBytes,
        new BigNumber(value)
      ).execute();

      evm.network.register({ contract });
      evm.stack.push(new BigNumber(contract.address, 16));
    },
    gasCost: () => 1,
  }),
  0xf3: new OpCode({
    name: 'RETURN',
    arguments: 1,
    onExecute: ({ evm }) => {
      const offset = evm.stack.pop().toNumber();
      const size = evm.stack.pop().toNumber();

      evm.setCallingContextReturnData(evm.memory.slice(offset, offset + size));
    },
    gasCost: () => 1,
  }),
  0xfd: new OpCode({
    name: 'REVERT',
    arguments: 1,
    onExecute: ({ evm }) => {
      const offset = evm.stack.pop().toNumber();
      const length = evm.stack.pop().toNumber();

      evm.setCallingContextReturnData(
        evm.memory.slice(offset, offset + length)
      );

      throw new Reverted('Reverted');
    },
    gasCost: () => 1,
  }),
};

export const mnemonicLookup: Record<string, number> = {};
Object.entries(opcodes).forEach(([opcode, opcodeImplementation]) => {
  const ref = mnemonicLookup[opcodeImplementation.mnemonic];
  if (ref) {
    throw Error(`Colliding opcode name (${ref} and ${opcode})`);
  }
  mnemonicLookup[opcodeImplementation.mnemonic] = parseInt(opcode);
});

function readEvmBuffer(evm: Evm, offset: number, length: number) {
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(evm.peekBuffer(offset + i).toNumber());
  }
  return new BigNumber(`0x${Buffer.from(numbers).toString('hex')}`);
}
