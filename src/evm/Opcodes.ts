import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { Contract } from './Contract';
import { InvalidJump } from './errors/InvalidJump';
import { Reverted } from './errors/Reverted';
import { Evm } from './Evm';
import { OpCode } from './OpCode';

const JUMP_DEST = 0x5b;

export const opcodes: Record<number, OpCode> = {
  // STOP
  0x0: new OpCode(0, ({ evm }) => {
    evm.stop();
  }),
  // MUL
  0x2: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop().toNumber();
    const b = evm.stack.pop().toNumber();
    evm.stack.push(a * b);
  }),
  // SUB
  0x3: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop().toNumber();
    const b = evm.stack.pop().toNumber();
    evm.stack.push(a - b);
  }),
  // EQ
  0x14: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop().toNumber();
    const b = evm.stack.pop().toNumber();

    evm.stack.push(Number(a === b));
  }),
  // XOR
  0x18: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop().toNumber();
    const b = evm.stack.pop().toNumber();
    evm.stack.push(a ^ b);
  }),
  // POP
  0x50: new OpCode(1, ({ evm }) => {
    evm.stack.pop();
  }),
  // SSTORAGE
  0x55: new OpCode(1, ({ evm }) => {
    const key = evm.stack.pop();
    const value = evm.stack.pop();

    evm.storage[key.toString()] = value;
  }),
  // PUSH1
  0x60: new OpCode(2, ({ evm }) => {
    evm.stack.push(evm.peekBuffer(1));
  }),
  // PUSH2
  0x61: new OpCode(3, ({ evm }) => {
    const value = readEvmBuffer(evm, 1, 2);
    evm.stack.push(value);
  }),
  // PUSH13
  0x6c: new OpCode(14, ({ evm }) => {
    const value = readEvmBuffer(evm, 1, 13);
    evm.stack.push(value);
  }),
  // DUP1
  0x80: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.stack.get(-1));
  }),
  // DUP2
  0x81: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.stack.get(evm.stack.length - 2));
  }),
  // SWAP1
  0x90: new OpCode(1, ({ evm }) => {
    const b = evm.stack.pop();
    const a = evm.stack.pop();

    evm.stack.push(b);
    evm.stack.push(a);
  }),
  // CALLVALUE
  0x34: new OpCode(1, ({ evm, context }) => {
    evm.stack.push(context.value.value);
  }),
  // CALLDATALOAD
  0x35: new OpCode(1, ({ evm, context }) => {
    const index = evm.stack.pop().toNumber();
    evm.stack.push(
      parseInt(context.data.slice(index, index + 32).toString('hex'), 16)
    );
  }),
  // CALLDATASIZE
  0x36: new OpCode(1, ({ evm, context }) => {
    evm.stack.push(context.data.length);
  }),
  // CALLDATACOPY
  0x37: new OpCode(1, ({ evm, context }) => {
    const dataOffset = evm.stack.pop().toNumber();
    const offset = evm.stack.pop().toNumber();
    const length = evm.stack.pop().toNumber();

    for (let i = 0; i < length; i++) {
      evm.memory[dataOffset + i] = context.data[offset + i];
    }
  }),
  // CODESIZE
  0x38: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.buffer.length);
  }),
  // EXTCODESIZE
  0x3b: new OpCode(1, ({ evm }) => {
    const addr = evm.stack.pop();
    const contract = evm.network.get(addr.toString());
    evm.stack.push(contract.length);
  }),
  // MSTORE
  0x52: new OpCode(1, ({ evm }) => {
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
  }),
  // JUMP
  0x56: new OpCode(1, ({ evm }) => {
    const pc = evm.stack.pop().toNumber();
    const opcode = evm.buffer[pc] == JUMP_DEST;
    if (!opcode) {
      throw new InvalidJump();
    }
    evm.setPc(pc);
    return {
      setPc: true,
    };
  }),
  // JUMPI
  0x57: new OpCode(1, ({ evm }) => {
    const pc = evm.stack.pop().toNumber();
    const condition = evm.stack.pop();

    if (condition) {
      const opcode = evm.buffer[pc] == JUMP_DEST;
      if (!opcode) {
        throw new InvalidJump();
      }
      evm.setPc(pc);
      return {
        setPc: true,
      };
    }
  }),
  // JUMPDEST
  0x5b: new OpCode(1, () => {
    // Just metadata
  }),
  // CREATE
  0xf0: new OpCode(1, ({ evm }) => {
    const value = evm.stack.pop().toNumber();
    const offset = evm.stack.pop().toNumber();
    const length = evm.stack.pop().toNumber();

    console.log([value, offset, length]);

    const contractBytes = evm.memory.slice(offset, offset + length);
    const contract = new Contract(contractBytes, new BigNumber(value));

    evm.network.register({ contract });
    evm.stack.push(new BigNumber(contract.address, 16));
  }),
  // REVERT
  0xfd: new OpCode(1, () => {
    throw new Reverted('Reverted');
  }),
};

function readEvmBuffer(evm: Evm, offset: number, length: number) {
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(evm.peekBuffer(offset + i).toNumber());
  }
  return new BigNumber(`0x${Buffer.from(numbers).toString('hex')}`);
}
