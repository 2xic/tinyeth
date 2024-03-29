import { OpcodeLookups } from './Opcodes';

export function getOpcodesFromBytes(input: Buffer) {
  const opcodes = [];
  let buffer = input;
  while (buffer.length) {
    const currentOpcode = buffer[0];
    const opcode = OpcodeLookups[currentOpcode];
    if (!opcode) {
      opcodes.push('INVALID');
      buffer = buffer.slice(1);
    } else {
      const opcodeArguments = buffer.slice(1, opcode.length);
      opcodes.push(
        [
          `${opcode.mnemonic}`, // (${currentOpcode.toString(16)})`,
          opcodeArguments.length ? `0x${opcodeArguments.toString('hex')}` : '',
        ].join(' ')
      );
      buffer = buffer.slice(!opcode.length ? 1 : opcode.length);
    }
  }
  return opcodes;
}
