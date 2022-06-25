import { opcodes } from './Opcodes';

export const mnemonicLookup: Record<string, number> = {};

Object.entries(opcodes).forEach(([opcode, opcodeImplementation]) => {
  const ref = mnemonicLookup[opcodeImplementation.mnemonic];
  if (ref) {
    throw Error(`Colliding opcode name (${ref} and ${opcode})`);
  }
  mnemonicLookup[opcodeImplementation.mnemonic] = parseInt(opcode);
});
