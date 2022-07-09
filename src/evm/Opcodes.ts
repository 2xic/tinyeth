import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { keccak256 } from '../utils/keccak256';
import { Address } from './Address';
import { Contract } from './Contract';
import { CreateOpCodeWIthVariableArgumentLength } from './CreateOpCodeWIthVariableArgumentLength';
import { InvalidJump } from './errors/InvalidJump';
import { Reverted } from './errors/Reverted';
import { Evm } from './Evm';
import { ExecutionResults, OpCode } from './OpCode';
import { SignedUnsignedNumberConverter } from './SignedUnsignedNumberConverter';

// TODO: see if there is away around this.
BigNumber.set({ EXPONENTIAL_AT: 1024 });

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
      stack.push(new BigNumber(a + b));
    },
    gasCost: 3,
  }),
  0x2: new OpCode({
    name: 'MUL',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(a * b));
    },
    gasCost: 5,
  }),
  0x3: new OpCode({
    name: 'SUB',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(a.minus(b));
    },
    gasCost: 3,
  }),
  0x4: new OpCode({
    name: 'DIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(Math.floor(a / b)));
    },
    gasCost: 5,
  }),
  0x5: new OpCode({
    name: 'SDIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(Math.floor(a / b)));
    },
    gasCost: 5,
  }),
  0x6: new OpCode({
    name: 'MOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(a % b));
    },
    gasCost: 5,
  }),
  0x7: new OpCode({
    name: 'SMOD',
    arguments: 1,
    gasCost: 5,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      const results = new SignedUnsignedNumberConverter().convert(
        new BigNumber(a.modulo(b))
      );
      stack.push(results);
    },
  }),
  0x8: new OpCode({
    name: 'ADDMOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      const c = stack.pop().toNumber();
      const newLocal = a.plus(b).modulo(new BigNumber(2).pow(256));

      stack.push(new BigNumber(newLocal.toNumber() % c));
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
      stack.push(new BigNumber(Math.pow(a, b)));

      return {
        setPc: false,
        computedGas: 10 + (b.toString(2).length - 1) * 50,
      };
    },
    gasCost: 0,
  }),
  0x10: new OpCode({
    name: 'LT',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(new BigNumber(Number(a.isLessThan(b))));
    },
    gasCost: 3,
  }),
  0x11: new OpCode({
    name: 'GT',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(new BigNumber(Number(a.isGreaterThan(b))));
    },
    gasCost: 3,
  }),
  0x12: new OpCode({
    name: 'SLT',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(new BigNumber(Number(a.isLessThan(b))));
    },
  }),
  0x13: new OpCode({
    name: 'SGT',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(new BigNumber(Number(a.isGreaterThan(b))));
    },
  }),
  0x14: new OpCode({
    name: 'EQ',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();

      stack.push(new BigNumber(Number(a === b)));
    },
    gasCost: 3,
  }),
  0x15: new OpCode({
    name: 'ISZERO',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();

      stack.push(new BigNumber(Number(a === 0)));
    },
    gasCost: 3,
  }),
  0x16: new OpCode({
    name: 'AND',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(a & b));
    },
  }),
  0x17: new OpCode({
    name: 'OR',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(a | b));
    },
  }),
  0x18: new OpCode({
    name: 'XOR',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = stack.pop().toNumber();
      stack.push(new BigNumber(a ^ b));
    },
    gasCost: 3,
  }),
  0x19: new OpCode({
    name: 'NOT',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = stack.pop().toNumber();
      const b = new BigNumber(2).pow(256);
      stack.push(b.plus(new BigNumber((~BigInt(a)).toString())));
    },
  }),
  0x1a: new OpCode({
    name: 'BYTE',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = BigInt(stack.pop().toString());
      const b = BigInt(stack.pop().toString());
      stack.push(
        new BigNumber(
          (b >> (BigInt(248) - a * BigInt(8)) && BigInt(0xff)).toString()
        )
      );
    },
  }),
  0x1b: new OpCode({
    name: 'SHL',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = BigInt(stack.pop().toString());
      const b = BigInt(stack.pop().toString());
      const c = (b << a).toString();

      stack.push(new BigNumber(c).modulo(new BigNumber(2).pow(256)));
    },
  }),
  0x1c: new OpCode({
    name: 'SHR',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = BigInt(stack.pop().toString());
      const b = BigInt(stack.pop().toString());
      const c = (b >> a).toString();

      stack.push(new BigNumber(c).modulo(new BigNumber(2).pow(256)));
    },
  }),
  0x1d: new OpCode({
    name: 'SAR',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = BigInt(
        new SignedUnsignedNumberConverter().parse(stack.pop()).toString()
      );
      const b = BigInt(
        new SignedUnsignedNumberConverter().parse(stack.pop()).toString()
      );
      const results = new SignedUnsignedNumberConverter().convert(
        new BigNumber((b >> a).toString())
      );
      stack.push(results);
    },
  }),
  0x20: new OpCode({
    name: 'SHA3',
    arguments: 1,
    gasCost: 30,
    onExecute: ({ stack, memory }) => {
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();
      const data = memory.read(offset, length);
      const hash = getBufferFromHex(keccak256(data));
      stack.push(new BigNumber(hash.toString('hex'), 16));

      const computedGas = Math.floor((6 * (length + 31)) / 32);
      return {
        computedGas,
        setPc: false,
      };
    },
  }),
  0x30: new OpCode({
    name: 'ADDRESS',
    arguments: 1,
    gasCost: 2,
    onExecute: ({ stack, context }) => {
      // Todo: this should be the last call, not the sender.
      // I think we should add some call stack.
      stack.push(context.sender.raw);
    },
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
  0x32: new OpCode({
    name: 'ORIGIN',
    arguments: 1,
    gasCost: 2,
    onExecute: ({ stack, context }) => {
      stack.push(context.sender.raw);
    },
  }),
  0x33: new OpCode({
    name: 'CALLER',
    arguments: 1,
    gasCost: 2,
    onExecute: ({ stack, context }) => {
      // Todo: this should be the last call, not the sender.
      stack.push(context.sender.raw);
    },
  }),
  0x34: new OpCode({
    name: 'CALLVALUE',
    arguments: 1,
    onExecute: ({ stack, context }) => {
      stack.push(new BigNumber(context.value.value));
    },
    gasCost: 2,
  }),
  0x35: new OpCode({
    name: 'CALLDATALOAD',
    arguments: 1,
    onExecute: ({ context, stack }) => {
      const index = stack.pop().toNumber();
      stack.push(
        new BigNumber(context.data.slice(index, index + 32).toString('hex'), 16)
      );
    },
    gasCost: () => 1,
  }),
  0x36: new OpCode({
    name: 'CALLDATASIZE',
    arguments: 1,
    onExecute: ({ stack, context }) => {
      stack.push(new BigNumber(context.data.length));
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
        memory.write(dataOffset + i, context.data[offset + i]);
      }
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x38: new OpCode({
    name: 'CODESIZE',
    arguments: 1,
    onExecute: ({ evm, stack }) => {
      stack.push(new BigNumber(evm.program.length));
    },
    gasCost: 2,
  }),
  0x39: new OpCode({
    name: 'CODECOPY',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const destOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      for (let i = 0; i < size; i++) {
        memory.write(destOffset + i, evm.program[offset + i]);
      }
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 1,
  }),
  0x3a: new OpCode({
    name: 'GASPRICE',
    arguments: 1,
    gasCost: () => 2,
  }),
  0x3b: new OpCode({
    name: 'EXTCODESIZE',
    arguments: 1,
    onExecute: ({ stack, network }) => {
      const stackItem = stack.pop();
      const contract = network.get(new Address(stackItem));
      stack.push(new BigNumber(contract.length));
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a5-balance-extcodesize-extcodehash
    gasCost: () => 1,
  }),
  0x3c: new OpCode({
    name: 'EXTCODECOPY',
    arguments: 1,
    gasCost: () => 1,
  }),
  0x3d: new OpCode({
    name: 'RETURNDATASIZE',
    arguments: 1,
    gasCost: () => 2,
  }),
  0x3e: new OpCode({
    name: 'RETURNDATACOPY',
    arguments: 1,
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a5-balance-extcodesize-extcodehash
    gasCost: () => 1,
  }),
  0x3f: new OpCode({
    name: 'EXTCODEHASH',
    arguments: 1,
    onExecute: ({ stack, network }) => {
      const address = stack.pop();
      const contract = network.get(new Address(address)).execute();
      const data = keccak256(contract.data);

      stack.push(new BigNumber(data.toString('hex'), 16));
    },
    // Has dynamic gas cost
    gasCost: () => 1,
  }),

  0x40: new OpCode({
    name: 'BLOCKHASH',
    arguments: 1,
    gasCost: () => 20,
    onExecute: ({ network, stack }) => {
      const height = stack.pop().toNumber();
      const block = network.getBlock({ height });
      stack.push(block.hash);
    },
  }),
  0x41: new OpCode({
    name: 'COINBASE',
    arguments: 1,
    onExecute: ({ stack, network }) => {
      const block = network.block;
      stack.push(block.coinbase);
    },
    gasCost: () => 2,
  }),
  0x42: new OpCode({
    name: 'TIMESTAMP',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const block = network.block;
      stack.push(new BigNumber(block.timeStamp.unix()));
    },
  }),
  0x43: new OpCode({
    // Block number
    name: 'NUMBER',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const block = network.block;
      stack.push(new BigNumber(block.height));
    },
  }),
  0x44: new OpCode({
    name: 'DIFFICULTY',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const block = network.block;
      stack.push(block.difficulty);
    },
  }),
  0x45: new OpCode({
    name: 'GASLIMIT',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, context }) => {
      stack.push(new BigNumber(context.gasLimit));
    },
  }),
  0x46: new OpCode({
    name: 'CHAINID',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const block = network.block;
      stack.push(new BigNumber(block.chainId));
    },
  }),
  0x47: new OpCode({
    name: 'SELFBALANCE',
    arguments: 1,
    gasCost: () => 2,
  }),
  0x48: new OpCode({
    name: 'BASEFEE',
    arguments: 1,
    gasCost: () => 2,
  }),

  0x50: new OpCode({
    name: 'POP',
    arguments: 1,
    onExecute: ({ stack }) => {
      stack.pop();
    },
    gasCost: 2,
  }),
  0x51: new OpCode({
    name: 'MLOAD',
    arguments: 1,
    // Todo this is dynamic
    gasCost: () => 3,
    onExecute: ({ memory, stack }) => {
      const offset = stack.pop().toNumber();
      const read = memory.read32(offset);
      stack.push(new BigNumber(read.toString('hex'), 16));
    },
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
        memory.write(offset + i, uint[i]);
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
  0x53: new OpCode({
    name: 'MSTORE8',
    arguments: 1,
    onExecute: ({ stack, memory }) => {
      const offset = stack.pop();
      const value = stack.pop().toString(16).slice(-2);
      memory.write(offset.toNumber(), new BigNumber(value, 16).toNumber());
    },
    // Todo this is dynamic
    gasCost: () => 3,
  }),
  0x54: new OpCode({
    name: 'SLOAD',
    arguments: 1,
    onExecute: ({ stack, storage }) => {
      const key = stack.pop();
      stack.push(storage.read({ key }));
    },
    // Todo this is dynamic
    gasCost: () => 3,
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
  0x58: new OpCode({
    name: 'PC',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, evm }) => {
      stack.push(new BigNumber(evm.pc));
    },
  }),
  0x59: new OpCode({
    name: 'MSIZE',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, memory }) => {
      stack.push(new BigNumber(memory.size));
    },
  }),
  0x5a: new OpCode({
    name: 'GAS',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, evm }, gasOpcode) => {
      stack.push(evm.gasLeft.minus(gasOpcode.gasCost));
    },
  }),
  0x5b: new OpCode({
    name: 'JUMPDEST',
    arguments: 1,
    onExecute: () => {
      // Just metadata
    },
    gasCost: 1,
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
  ...CreateOpCodeWIthVariableArgumentLength({
    fromOpcode: 0xa0,
    toOpcode: 0xa4,
    baseName: 'LOG',
    arguments: (index) => index + 1,
    iteratedExecuteConstruction: () => () => {
      // This should not change the EVM state, but need to add gas adjustments
      // It's used for events.
    },
    // TODO: Implement gas
    gasCost: 3,
  }),
  0xf0: new OpCode({
    name: 'CREATE',
    arguments: 1,
    onExecute: ({ stack, memory, network, context }) => {
      const value = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      const contractBytes = memory.read(offset, length);
      const contract = new Contract(
        contractBytes,
        new BigNumber(value),
        context
      ).execute();

      network.register({ contract });
      stack.push(contract.address.raw);
    },
    // Todo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a9-create-operations
    gasCost: () => 1,
  }),
  0xf1: new OpCode({
    name: 'CALL',
    arguments: 1,
    // TODo this is dynamic
    gasCost: () => 2,
  }),
  0xf2: new OpCode({
    name: 'CALLCODE',
    arguments: 1,
    // TODo this is dynamic
    gasCost: () => 2,
  }),
  0xf3: new OpCode({
    name: 'RETURN',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      evm.setCallingContextReturnData(memory.read(offset, offset + size));
    },
    // TOdo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
  0xf4: new OpCode({
    name: 'DELEGATECALL',
    arguments: 1,
    // TODo this is dynamic
    gasCost: () => 2,
  }),
  0xf5: new OpCode({
    name: 'CREATE2',
    arguments: 1,
    // TODo this is dynamic
    gasCost: () => 2,
  }),
  0xfa: new OpCode({
    name: 'STATICCALL',
    arguments: 1,
    // TODo this is dynamic
    gasCost: () => 2,
  }),
  0xfd: new OpCode({
    name: 'REVERT',
    arguments: 1,
    onExecute: ({ evm, stack, memory }) => {
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      evm.setCallingContextReturnData(memory.read(offset, length));

      throw new Reverted('Reverted');
    },
    // TOdo implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 1,
  }),
  0xfe: new OpCode({
    name: 'INVALID',
    arguments: 1,
    gasCost: () => 2,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onExecute: () => {},
  }),
  0xff: new OpCode({
    name: 'SELFDESTRUCT',
    arguments: 1,
    gasCost: () => 2,
  }),
};

function readEvmBuffer(evm: Evm, offset: number, length: number) {
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(evm.peekBuffer(offset + i).toNumber());
  }
  return new BigNumber(`0x${Buffer.from(numbers).toString('hex')}`);
}
