import { convertNumberToPadHex } from '../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { mnemonicLookup } from './MnemonicLookup';
import { opcodes } from './Opcodes';

export class MnemonicParser {
  public parse(options: ScriptInterface | ConvertInterface): Buffer {
    if ('mnemonics' in options) {
      return this.convert(options);
    }
    const mnemonics = options.script.split('\n');
    return this.convert({ mnemonics });
  }

  private convert({ mnemonics }: ConvertInterface) {
    let bytesCodes = Buffer.alloc(0);
    for (const mnemonic of mnemonics) {
      const opcode_arguments = mnemonic.trim().split(' ');
      const opcode = opcode_arguments[0];
      if (opcode.startsWith('//')) {
        continue;
      } else if (!opcode.length) {
        continue;
      }
      const foundOpcode = mnemonicLookup[opcode.toUpperCase()];
      if (foundOpcode === undefined) {
        throw new Error('Unknown mnemonic ' + opcode);
      }
      const converted_arguments = opcode_arguments
        .slice(1, opcodes[foundOpcode].length)
        .map((item) =>
          item.startsWith('0x')
            ? getBufferFromHex(item).toString('hex')
            : convertNumberToPadHex(item)
        )
        .join('');

      const encodedOpcode = [foundOpcode];
      bytesCodes = Buffer.concat([
        bytesCodes,
        Buffer.from(encodedOpcode),
        Buffer.from(converted_arguments, 'hex'),
      ]);
    }
    return bytesCodes;
  }
}

interface ConvertInterface {
  mnemonics: string[];
}

interface ScriptInterface {
  script: string;
}
