import { OpCode } from './OpCode';

export const opcodes: Record<number, OpCode> = {
  // STOP
  0x0: new OpCode(0, ({ evm }) => {
    evm.stop();
  }),
  // SUB
  0x3: new OpCode(1, ({ evm }) => {
    const b = evm.stack.shift();
    const a = evm.stack.shift();
    evm.stack.push(a - b);
  }),
  // POP
  0x50: new OpCode(1, ({ evm }) => {
    evm.stack.shift();
  }),
  // SSTORAGE
  0x55: new OpCode(1, ({ evm }) => {
    const key = evm.stack.shift();
    const value = evm.stack.shift();

    evm.storage[key] = value;
  }),
  // PUSH1
  0x60: new OpCode(2, ({ evm, byteIndex }) => {
    evm.stack.push(evm.buffer[byteIndex + 1]);
  }),
  // DUP1
  0x80: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.stack.get(evm.stack.length - 1));
  }),
  // DUP2
  0x81: new OpCode(1, ({ evm }) => {
    evm.stack.push(evm.stack.get(evm.stack.length - 2));
  }),
  // SWAP1
  0x90: new OpCode(1, ({ evm }) => {
    const startIndex = 0;
    const prev = evm.stack.get(startIndex + 1);
    const prevPrev = evm.stack.get(startIndex);

    evm.stack.set(startIndex + 1, prevPrev);
    evm.stack.set(startIndex, prev);
  }),
  // CALLVALUE
  0x34: new OpCode(1, ({ evm, context }) => {
    evm.stack.push(context.value.value);
  }),
  // JUMP
  0x56: new OpCode(0, ({ evm }) => {
    const pc = evm.stack.shift();
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
