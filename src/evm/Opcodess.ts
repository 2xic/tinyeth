import { OpCode } from './OpCode';

export const opcodes: Record<number, OpCode> = {
	// POP
	0x50: new OpCode(1, ({ evm }) => {
		evm.stack.pop();
	}),
	// SSTORAGE
	0x55: new OpCode(1, ({ evm }) => {
		const key = evm.stack.shift() || 0;
		const value = evm.stack.shift() || 0;

		evm.storage[key] = value;
	}),
	// PUSH1
	0x60: new OpCode(2, ({ evm, byteIndex }) => {
		evm.stack.push(evm.buffer[byteIndex + 1]);
	}),
	// DUP1
	0x80: new OpCode(1, ({ evm }) => {
		evm.stack.push(evm.stack[evm.stack.length - 1]);
	}),
	// DUP2
	0x81: new OpCode(1, ({ evm }) => {
		evm.stack.push(evm.stack[evm.stack.length - 2]);
	}),
	// SWAP1
	0x90: new OpCode(1, ({ evm }) => {
		const startIndex = 0;
		const prev = evm.stack[startIndex + 1];
		const prevPrev = evm.stack[startIndex];

		evm.stack[startIndex + 1] = prevPrev;
		evm.stack[startIndex] = prev;
	}),
};
