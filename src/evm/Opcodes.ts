import BigNumber from 'bignumber.js';
import { InvalidJump } from './errors/InvalidJump';
import { Reverted } from './errors/Reverted';
import { UnimplementedOpcode } from './errors/UnimplementedOpcode';
import { OpCode } from './OpCode';

const JUMP_DEST = 0x5b;

export const opcodes: Record<number, OpCode> = {
  // STOP
  0x0: new OpCode(0, ({ evm }) => {
    evm.stop();
  }),
  // MUL
  0x2: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop();
    const b = evm.stack.pop();
    evm.stack.push(a * b);
  }),
  // SUB
  0x3: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop();
    const b = evm.stack.pop();
    evm.stack.push(a - b);
  }),
  // EQ
  0x14: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop();
    const b = evm.stack.pop();

    evm.stack.push(Number(a === b));
  }),
  // XOR
  0x18: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop();
    const b = evm.stack.pop();
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

    evm.storage[key] = value;
  }),
  // PUSH1
  0x60: new OpCode(2, ({ evm }) => {
    evm.stack.push(evm.peekBuffer(1));
  }),
  // PUSH2
  0x61: new OpCode(3, ({ evm }) => {
    const value = parseInt(
      Buffer.from([evm.peekBuffer(1), evm.peekBuffer(2)]).toString('hex'),
      16
    );
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
    const index = evm.stack.pop();
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
    const dataOffset = evm.stack.pop();
    const offset = evm.stack.pop();
    const length = evm.stack.pop();
    for (let i = 0; i < length; i++) {
      evm.memory[dataOffset + i] = context.data[offset + i];
    }
  }),
  // JUMP
  0x56: new OpCode(1, ({ evm }) => {
    const pc = evm.stack.pop();
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
    const pc = evm.stack.pop();
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
  // CODESIZE
  0x38: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.buffer.length);
  }),
  // CREATE
  0xf0: new OpCode(1, ({ evm }) => {
    const value = evm.stack.pop();
    const offset = evm.stack.pop();
    const length = evm.stack.pop();

    throw new UnimplementedOpcode('CREATE');
  }),
  // REVERT
  0xfd: new OpCode(1, () => {
    throw new Reverted('Reverted');
  }),
};
