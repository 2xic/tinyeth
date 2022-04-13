import { OpCode } from './OpCode';

export const opcodes: Record<number, OpCode> = {
  // STOP
  0x0: new OpCode(0, ({ evm }) => {
    evm.stop();
  }),
  // SUB
  0x3: new OpCode(1, ({ evm }) => {
    const a = evm.stack.pop();
    const b = evm.stack.pop();
    evm.stack.push(a - b);
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
  0x60: new OpCode(2, ({ evm, byteIndex }) => {
    evm.stack.push(evm.buffer[byteIndex + 1]);
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
  // CALLDATASIZE
  0x36: new OpCode(1, ({ evm, context }) => {
    evm.stack.push(context.data.length);
  }),
  // JUMP
  0x56: new OpCode(0, ({ evm }) => {
    const pc = evm.stack.pop();
    evm.setPc(pc);
  }),
  // JUMPDEST
  0x5b: new OpCode(1, () => {
    // Just metadata
  }),
  // CODESIZE
  0x38: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.buffer.length);
  }),
};
