import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { convertNumberToPadHex } from '../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { keccak256 } from '../utils/keccak256';
import { Address } from './Address';
import { Contract } from './Contract';
import { CreateOpCodeWIthVariableArgumentLength } from './CreateOpCodeWIthVariableArgumentLength';
import { Reverted } from './errors/Reverted';
import { Wei } from './eth-units/Wei';
import { Evm } from './Evm';
import { isValidJump } from './evmJumpCheck';
import { EvmNumberHandler } from './EvmNumberHandler';
import { computeGasSentWithCall } from './gas/computeGasSentWithCall';
import { wordSize } from './gas/wordSize';
import { getBigNumberFromBoolean } from './getBigNumberFromBoolean';
import { ExecutionResults, OpCode } from './OpCode';
import { SignedUnsignedNumberConverter } from './SignedUnsignedNumberConverter';

// TODO: see if there is away around this.
BigNumber.set({ EXPONENTIAL_AT: 1024 });

/*
  TODO: 
    - All mathematical operators should use BigNumber directly
    - They should use the SignedUnsignedNumberConverter.
*/

export const Opcodes: Record<number, OpCode> = {
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
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(a.plus(b));
    },
    gasCost: 3,
  }),
  0x2: new OpCode({
    name: 'MUL',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(a.multipliedBy(b));
    },
    gasCost: 5,
  }),
  0x3: new OpCode({
    name: 'SUB',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(a.minus(b));
    },
    gasCost: 3,
  }),
  0x4: new OpCode({
    name: 'DIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = new EvmNumberHandler(stack.pop());
      const b = new EvmNumberHandler(stack.pop());
      stack.push(a.divideFloor(b));
    },
    gasCost: 5,
  }),
  0x5: new OpCode({
    name: 'SDIV',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = new EvmNumberHandler(stack.pop());
      const b = new EvmNumberHandler(stack.pop());
      stack.push(a.divideFloor(b));
    },
    gasCost: 5,
  }),
  0x6: new OpCode({
    name: 'MOD',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(new BigNumber(a).modulo(b));
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
      const c = stack.pop();
      const newLocal = a.plus(b).modulo(new BigNumber(2).pow(256));

      stack.push(new BigNumber(newLocal).modulo(c));
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
      const a = stack.pop();
      const b = stack.pop();
      stack.push(new BigNumber(a).pow(b));

      return {
        setPc: false,
        dynamicGasCost: 10 + (b.toString(2).length - 1) * 50,
        dynamicGasRefund: 0,
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
      stack.push(getBigNumberFromBoolean(a.isLessThan(b)));
    },
    gasCost: 3,
  }),
  0x11: new OpCode({
    name: 'GT',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(getBigNumberFromBoolean(a.isGreaterThan(b)));
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
      stack.push(getBigNumberFromBoolean(a.isLessThan(b)));
    },
  }),
  0x13: new OpCode({
    name: 'SGT',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = new SignedUnsignedNumberConverter().parse(stack.pop());
      const b = new SignedUnsignedNumberConverter().parse(stack.pop());
      stack.push(getBigNumberFromBoolean(a.isGreaterThan(b)));
    },
  }),
  0x14: new OpCode({
    name: 'EQ',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(getBigNumberFromBoolean(a.isEqualTo(b)));
    },
    gasCost: 3,
  }),
  0x15: new OpCode({
    name: 'ISZERO',
    arguments: 1,
    onExecute: ({ stack }) => {
      stack.push(getBigNumberFromBoolean(stack.pop().isZero()));
    },
    gasCost: 3,
  }),
  0x16: new OpCode({
    name: 'AND',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = new EvmNumberHandler(stack.pop());
      const b = new EvmNumberHandler(stack.pop());
      const results = a.and(b);
      stack.push(results);
    },
  }),
  0x17: new OpCode({
    name: 'OR',
    arguments: 1,
    gasCost: 3,
    onExecute: ({ stack }) => {
      const a = new EvmNumberHandler(stack.pop());
      const b = new EvmNumberHandler(stack.pop());
      const results = a.or(b);
      stack.push(results);
    },
  }),
  0x18: new OpCode({
    name: 'XOR',
    arguments: 1,
    onExecute: ({ stack }) => {
      const a = new EvmNumberHandler(stack.pop());
      const b = new EvmNumberHandler(stack.pop());
      const results = a.xor(b);
      stack.push(results);
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
    onExecute: ({ stack, memory, gasComputer }) => {
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();
      const data = memory.read(offset, length);
      const hash = getBufferFromHex(keccak256(data));
      stack.push(new BigNumber(hash.toString('hex'), 16));

      const computedGas =
        6 *
          wordSize({
            address: new BigNumber(length),
          }).toNumber() +
        gasComputer.memoryExpansion({
          address: new BigNumber(offset + length),
        }).gasCost;

      return {
        dynamicGasCost: computedGas,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
  }),
  0x30: new OpCode({
    name: 'ADDRESS',
    arguments: 1,
    gasCost: 2,
    onExecute: ({ stack, context }) => {
      // TODO: this should be the last call, not the sender.
      // I think we should add some call stack.
      stack.push(context.sender.raw);
    },
  }),
  0x31: new OpCode({
    name: 'BALANCE',
    arguments: 1,
    onExecute: ({
      stack,
      gasComputer,
      accessSets,
      evmAccountState,
      context,
    }) => {
      const address = stack.pop();
      stack.push(evmAccountState.getBalance({ address: context.sender }));

      const gasComputed = gasComputer.account({
        address,
      });
      accessSets.touchAddress({
        address,
      });
      return {
        dynamicGasCost: gasComputed.gasCost,
        dynamicGasRefund: gasComputed.gasRefund,
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
      // TODO: this should be the last call, not the sender.
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
      const value = new BigNumber(
        context.data
          .slice(index, index + 32)
          .toString('hex')
          .padEnd(64, '0'),
        16
      );

      stack.push(value);
    },
    gasCost: () => 3,
  }),
  0x36: new OpCode({
    name: 'CALLDATASIZE',
    arguments: 1,
    onExecute: ({ stack, context }) => {
      stack.push(new BigNumber(context.data.length));
    },
    gasCost: 2,
  }),
  0x37: new OpCode({
    name: 'CALLDATACOPY',
    arguments: 1,
    onExecute: ({ stack, memory, context, gasComputer }) => {
      const dataOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      let value = context.data.slice(offset, offset + length);
      if (value.length < length) {
        value = Buffer.concat([value, Buffer.alloc(length - value.length)]);
      }
      memory.write32(dataOffset, value);

      return {
        dynamicGasCost:
          3 +
          3 * wordSize({ address: new BigNumber(length) }).toNumber() +
          gasComputer.memoryExpansion({
            address: new BigNumber(memory.raw.length),
          }).gasCost,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
    gasCost: 0,
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
    onExecute: ({ evm, stack, memory, gasComputer }) => {
      const destOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      for (let i = 0; i < size; i++) {
        memory.write(destOffset + i, evm.program[offset + i]);
      }

      return {
        dynamicGasCost:
          3 *
            wordSize({
              address: new BigNumber(size),
            }).toNumber() +
          gasComputer.memoryExpansion({
            address: new BigNumber(memory.raw.length),
          }).gasCost,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a3-copy-operations
    gasCost: () => 3,
  }),
  0x3a: new OpCode({
    name: 'GASPRICE',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const gasPrice = network.block.gasPrice;
      stack.push(new BigNumber(gasPrice));
    },
  }),
  0x3b: new OpCode({
    name: 'EXTCODESIZE',
    arguments: 1,
    onExecute: ({ stack, network, gasComputer }) => {
      const stackItem = stack.pop();
      const contract = network.get(new Address(stackItem));
      stack.push(new BigNumber(contract.length));

      const gas = gasComputer.account({ address: stackItem });

      return {
        setPc: false,
        dynamicGasCost: gas.gasCost,
        dynamicGasRefund: gas.gasRefund,
      };
    },
    gasCost: () => 0,
  }),
  0x3c: new OpCode({
    name: 'EXTCODECOPY',
    arguments: 1,
    gasCost: () => 0,
    onExecute: ({ stack, network, memory, gasComputer }) => {
      const address = stack.pop();
      const destOffset = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();
      const contract = network.get(new Address(address));
      const contractData = contract.data;
      let written = 0;
      contractData.slice(offset, offset + size).forEach((item, index) => {
        memory.write(destOffset + index, item);
        written++;
      });
      const delta = size - written;
      for (let i = 0; i < delta; i++) {
        memory.write(destOffset + written++, 0);
      }

      const memoryCost = gasComputer.memoryExpansion({
        address: new BigNumber(offset + size),
      }).gasCost;
      const computedGas =
        3 *
          wordSize({
            address: new BigNumber(size),
          }).toNumber() +
        memoryCost +
        gasComputer.account({
          address,
        }).gasCost;

      return {
        setPc: false,
        dynamicGasRefund: 0,
        dynamicGasCost: computedGas,
      };
    },
  }),
  0x3d: new OpCode({
    name: 'RETURNDATASIZE',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, subContext }) => {
      const lastData = subContext.last.returnData;

      if (lastData && lastData.length) {
        stack.push(new BigNumber(lastData.length));
      } else {
        throw new Error('Invalid - I think');
      }
    },
  }),
  0x3e: new OpCode({
    name: 'RETURNDATACOPY',
    arguments: 1,
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a5-balance-extcodesize-extcodehash
    onExecute: ({ stack, memory, subContext }) => {
      const destOffset = stack.pop();
      const offset = stack.pop();
      const length = stack.pop();
      const lastData = subContext.last.returnData?.slice(
        offset.toNumber(),
        offset.plus(length).toNumber()
      );

      if (lastData && lastData.length) {
        lastData.forEach((item, index) => {
          memory.write(destOffset.toNumber() + index, item);
        });
      } else {
        throw new Error('Invalid - I think');
      }
    },
    gasCost: () => 1,
  }),
  0x3f: new OpCode({
    name: 'EXTCODEHASH',
    arguments: 1,
    onExecute: ({ stack, network }) => {
      const address = stack.pop();
      const contract = network.get(new Address(address));
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
    gasCost: () => 5,
    onExecute: ({ stack, context, evmAccountState }) => {
      stack.push(evmAccountState.getBalance({ address: context.sender }));
    },
  }),
  0x48: new OpCode({
    name: 'BASEFEE',
    arguments: 1,
    gasCost: () => 2,
    onExecute: ({ stack, network }) => {
      const baseFee = network.block.baseFee;
      stack.push(new BigNumber(baseFee));
    },
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
    // TODO this is dynamic
    gasCost: () => 3,
    onExecute: ({ memory, stack, gasComputer }) => {
      const offset = stack.pop().toNumber();
      const read = memory.read32(offset);
      stack.push(new BigNumber(read.toString('hex'), 16));

      const gas = gasComputer.memoryExpansion({
        address: new BigNumber(memory.raw.length),
      });

      return {
        dynamicGasCost: gas.gasCost,
        dynamicGasRefund: gas.gasRefund,
        setPc: false,
      };
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

      memory.write32(offset, uint);

      const computedGas = gasComputer.memoryExpansion({
        address: new BigNumber(memory.raw.length),
      });

      return {
        dynamicGasCost: computedGas.gasCost,
        dynamicGasRefund: computedGas.gasRefund,
        setPc: false,
      };
    },
    gasCost: () => 3,
  }),
  0x53: new OpCode({
    name: 'MSTORE8',
    arguments: 1,
    onExecute: ({ stack, memory, gasComputer }) => {
      const offset = stack.pop();
      const value = stack.pop().toString(16).slice(-2);
      memory.write(offset.toNumber(), new BigNumber(value, 16).toNumber());

      const { gasCost, gasRefund } = gasComputer.memoryExpansion({
        address: new BigNumber(memory.raw.length),
      });

      return {
        setPc: false,
        dynamicGasCost: gasCost,
        dynamicGasRefund: gasRefund,
      };
    },
    gasCost: () => 3,
  }),
  0x54: new OpCode({
    name: 'SLOAD',
    arguments: 1,
    onExecute: async ({ stack, storage, context, gasComputer }) => {
      const key = stack.pop();
      const value = await storage.read({ key, address: context.receiver });
      const gas = gasComputer.sload({
        key,
        address: '0xdeadbeef',
      });

      gasComputer.warmKey({
        key,
        address: '0xdeadbeef',
      });

      stack.push(value);

      return {
        dynamicGasCost: gas.gasCost,
        dynamicGasRefund: gas.gasRefund,
        setPc: false,
      };
    },
    gasCost: () => 0,
  }),
  0x55: new OpCode({
    name: 'SSTORE',
    arguments: 1,
    onExecute: ({ stack, gasComputer, storage }): ExecutionResults => {
      const key = stack.pop();
      const value = stack.pop();
      const gas = gasComputer.sstore({
        gasLeft: 10_000, // evm.gasLeft.toNumber(),
        address: '0xdeadbeef',
        key,
        value,
      });

      storage.write({ key, value });

      return {
        setPc: false,
        dynamicGasCost: gas.gasCost,
        dynamicGasRefund: gas.gasRefund,
      };
    },
    gasCost: () => 0,
  }),
  0x56: new OpCode({
    name: 'JUMP',
    arguments: 1,
    onExecute: ({ evm, stack }) => {
      const pc = stack.pop().toNumber();
      const opCodeAtPc = evm.program[pc];
      isValidJump({
        pc,
        opCodeAtPc,
        currentPc: evm.pc,
      });

      evm.setPc(pc);
      return {
        setPc: true,
        dynamicGasCost: 0,
        dynamicGasRefund: 0,
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

      if (!condition.isEqualTo(0)) {
        const opCodeAtPc = evm.program[pc];
        isValidJump({
          pc,
          opCodeAtPc,
          currentPc: evm.pc,
        });

        evm.setPc(pc);
        return {
          setPc: true,
          dynamicGasCost: 0,
          dynamicGasRefund: 0,
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
    gasCost: 2,
    onExecute: (context, opcode) => {
      const { stack, evm } = context;
      stack.push(evm.gasLeft.minus(opcode.staticGasCost));
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
    deltaStart: 0,
    arguments: 1,
    iteratedExecuteConstruction:
      (topicCount) =>
      ({ stack, gasComputer }) => {
        const offset = stack.pop();
        const size = stack.pop();
        for (let i = 0; i < topicCount; i++) {
          stack.pop();
        }

        const { gasCost: memoryExpansion, gasRefund } =
          gasComputer.memoryExpansion({
            address: offset.plus(size),
          });
        const computedGas =
          375 * (topicCount + 1) + 8 * size.toNumber() + memoryExpansion;

        return {
          dynamicGasCost: computedGas,
          dynamicGasRefund: gasRefund,
          setPc: false,
        };
      },
    gasCost: 0,
  }),
  0xf0: new OpCode({
    name: 'CREATE',
    arguments: 1,
    onExecute: async ({
      stack,
      memory,
      network,
      context,
      evmSubContextCall,
      evmContext,
      gasComputer,
    }) => {
      const value = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      const contractBytes = memory.read(offset, length);

      const forkedEvm = evmSubContextCall.fork({
        txContext: {
          ...context,
          data: Buffer.alloc(0),
        },
        evmContext: evmContext,
      });

      const contract = await new Contract({
        program: contractBytes,
        value: new BigNumber(value),
        context,
      }).execute(forkedEvm);

      network.register({ contract });
      stack.push(contract.address.raw);
      gasComputer.warmAddress({ address: contract.address });

      const codeDepositCost = 200 * contract.length;
      const deploymentCost = forkedEvm.evm.gasCost();
      const computedGas = codeDepositCost + deploymentCost;

      return {
        dynamicGasCost: computedGas,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
    gasCost: () => 32000,
  }),
  0xf1: new OpCode({
    name: 'CALL',
    arguments: 1,
    // TODO this is dynamic
    gasCost: () => 2,
    onExecute: async ({
      stack,
      gasComputer,
      evmSubContextCall,
      evmContext,
    }) => {
      const gas = stack.pop();
      const address = new Address(stack.pop());
      const value = stack.pop();
      const argsOffset = stack.pop();

      const argsSize = stack.pop();
      const retOffset = stack.pop();
      const retSize = stack.pop();

      const baseGas = gasComputer.baseGas({
        address,
        value: new Wei(value),
        memoryOffsets: {
          argsOffset,
          argsSize,
        },
      }).gasCost;

      await evmSubContextCall.createSubContext({
        baseGas,
        evmContext,
        gasLimit: evmContext.context.gasLimit,
        optionsSubContext: {
          gas,
          address,
          argsOffset,
          value,
          argsSize,
          retOffset,
          retSize,
        },
      });
    },
  }),
  0xf2: new OpCode({
    name: 'CALLCODE',
    arguments: 1,
    // TODO this is dynamic
    gasCost: () => 2,
    onExecute: async ({
      stack,
      gasComputer,
      evmSubContextCall,
      evmContext,
    }) => {
      const gas = stack.pop();
      const address = new Address(stack.pop());
      const value = stack.pop();
      const argsOffset = stack.pop();

      const argsSize = stack.pop();
      const retOffset = stack.pop();
      const retSize = stack.pop();

      const baseGas = gasComputer.baseGas({
        address,
        value: new Wei(value),
        memoryOffsets: {
          argsOffset,
          argsSize,
        },
      }).gasCost;

      const { gasCost } = await evmSubContextCall.createSubContext({
        baseGas,
        evmContext,
        gasLimit: evmContext.context.gasLimit,
        optionsSubContext: {
          gas,
          address,
          argsOffset,
          value,
          argsSize,
          retOffset,
          retSize,
        },
      });

      return {
        dynamicGasCost: gasCost,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
  }),
  0xf3: new OpCode({
    name: 'RETURN',
    arguments: 1,
    onExecute: ({ evm, stack, memory, gasComputer }) => {
      const offset = stack.pop().toNumber();
      const size = stack.pop().toNumber();

      evm.setCallingContextReturnData(memory.read(offset, size).slice(0, size));

      const { gasCost, gasRefund } = gasComputer.memoryExpansion({
        address: new BigNumber(offset + size),
      });

      return {
        dynamicGasCost: gasCost,
        dynamicGasRefund: gasRefund,
        setPc: false,
      };
    },
    // TODO implement https://github.com/wolflo/evm-opcodes/blob/main/gas.md#a0-1-memory-expansion
    gasCost: () => 0,
  }),
  0xf4: new OpCode({
    name: 'DELEGATECALL',
    arguments: 1,
    // TODO this is dynamic
    gasCost: () => 100,
    onExecute: async ({
      stack,
      evmContext,
      evmSubContextCall,
      evm,
      gasComputer,
    }) => {
      const gas = stack.pop();
      const address = new Address(stack.pop());
      const argsOffset = stack.pop();

      const argsSize = stack.pop();
      const retOffset = stack.pop();
      const retSize = stack.pop();

      let computedGas = 0;

      if (!gas.isZero()) {
        const baseGas = gasComputer.baseGas({
          address,
          value: new Wei(new BigNumber(0)),
          memoryOffsets: {
            argsOffset,
            argsSize,
          },
        }).gasCost;
        const gasSentWithCall = computeGasSentWithCall({
          requestedGas: gas,
          availableGas: evm.gasLeft.toNumber(),
          baseGas,
        });

        if (computedGas > gasSentWithCall) {
          throw new Error('Too much gas');
        }

        const { gasCost } = await evmSubContextCall.createSubContext({
          baseGas,
          evmContext,
          gasLimit: new BigNumber(gasSentWithCall),
          optionsSubContext: {
            gas,
            address,
            argsOffset,
            argsSize,
            retOffset,
            retSize,
            copy: false,
          },
        });

        computedGas = gasCost;

        gasComputer.warmAddress({
          address,
        });
      }

      return {
        dynamicGasCost: computedGas,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
  }),
  0xf5: new OpCode({
    name: 'CREATE2',
    arguments: 1,
    // TODO this is dynamic
    gasCost: () => 2,
    onExecute: async ({
      stack,
      memory,
      network,
      context,
      evmSubContextCall,
      evmContext,
    }) => {
      const value = stack.pop().toNumber();
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();
      const saltValue = convertNumberToPadHex(stack.pop().toString(16));
      const salt = Buffer.from(saltValue, 'hex');

      const contractBytes = memory.read(offset, length);
      const forkedEvm = evmSubContextCall.fork({
        txContext: context,
        evmContext: evmContext,
      });
      const contract = await new Contract({
        program: contractBytes,
        value: new BigNumber(value),
        context,
        salt,
      }).execute(forkedEvm);

      const success = network.register({ contract });
      if (success) {
        stack.push(contract.address.raw);
      } else {
        stack.push(new BigNumber(0));
      }
    },
  }),
  0xfa: new OpCode({
    name: 'STATICCALL',
    arguments: 1,
    // TODO this is dynamic
    gasCost: () => 0,
    onExecute: async ({
      stack,
      evmSubContextCall,
      evm,
      evmContext,
      gasComputer,
    }) => {
      const gas = stack.pop();
      const address = new Address(stack.pop());
      const argsOffset = stack.pop();

      const argsSize = stack.pop();
      const retOffset = stack.pop();
      const retSize = stack.pop();

      let computedGas = 0;

      const baseGas = gasComputer.baseGas({
        address,
        value: new Wei(new BigNumber(0)),
        memoryOffsets: {
          argsOffset,
          argsSize,
        },
      }).gasCost;
      const gasSentWithCall = computeGasSentWithCall({
        requestedGas: gas,
        availableGas: evm.gasLeft.toNumber(),
        baseGas,
      });

      const { gasCost } = await evmSubContextCall.createSubContext({
        baseGas,
        evmContext,
        gasLimit: evmContext.context.gasLimit,
        optionsSubContext: {
          gas,
          address,
          argsOffset,
          argsSize,
          retOffset,
          retSize,
          copy: true,
        },
      });

      if (computedGas > gasSentWithCall) {
        throw new Error('Too much gas');
      }

      gasComputer.warmAddress({
        address,
      });

      computedGas = gasCost;

      return {
        dynamicGasCost: computedGas,
        dynamicGasRefund: 0,
        setPc: false,
      };
    },
  }),
  0xfd: new OpCode({
    name: 'REVERT',
    arguments: 1,
    onExecute: ({ evm, stack, memory, gasComputer }) => {
      const offset = stack.pop().toNumber();
      const length = stack.pop().toNumber();

      gasComputer.memoryExpansion({
        address: new BigNumber(offset + length),
      });

      evm.setCallingContextReturnData(memory.read(offset, length));

      throw new Reverted(
        `Ran Reverted opcode ${memory.read(offset, length).toString('utf-8')}`
      );
    },
    gasCost: () => 0,
  }),
  0xfe: new OpCode({
    name: 'INVALID',
    arguments: 1,
    gasCost: () => 0,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onExecute: () => {
      throw new Reverted('Ran INVALID opcode');
    },
  }),
  0xff: new OpCode({
    name: 'SELFDESTRUCT',
    arguments: 1,
    // TODO, this is dynamic
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
