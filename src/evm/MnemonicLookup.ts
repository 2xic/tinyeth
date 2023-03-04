import { OpcodeLookups } from './Opcodes';

export const mnemonicLookup: Record<string, number> = {};

export function loadLookupTable() {
  if (Object.entries(mnemonicLookup).length == 0) {
    Object.entries(OpcodeLookups).forEach(([opcode, opcodeImplementation]) => {
      const ref = mnemonicLookup[opcodeImplementation.mnemonic];
      if (ref && ref !== parseInt(opcode)) {
        throw Error(`Colliding opcode name (${ref} and ${opcode})`);
      }
      mnemonicLookup[opcodeImplementation.mnemonic] = parseInt(opcode);
    });
  }
}
