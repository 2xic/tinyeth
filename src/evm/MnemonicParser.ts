import { convertNumberToPadHex } from '../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { mnemonicLookup } from './MnemonicLookup';
import { opcodes } from './Opcodes';

export class MnemonicParser {
  public parse(options: ScriptInterface | ConvertInterface): Buffer {
    if ('mnemonics' in options) {
      return this.convert(options);
    }
    const mnemonics = options.script
      .split('\n')
      .filter((item) => item.length)
      .map((item) => item.trim());

    return this.convert({ mnemonics });
  }

  private convert({ mnemonics }: ConvertInterface) {
    let bytesCodes = Buffer.alloc(0);
    for (const mnemonic of mnemonics) {
      const opcode_arguments = mnemonic.split(' ');
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
      let converted_arguments = Buffer.from(
        opcode_arguments
          .slice(1, opcodes[foundOpcode].length)
          .map((item) =>
            item.startsWith('0x')
              ? getBufferFromHex(item).toString('hex')
              : convertNumberToPadHex(item)
          )
          .join(''),
        'hex'
      );
      const argumentsPadding = opcodes[foundOpcode].length - 1;
      if (converted_arguments.length < argumentsPadding) {
        converted_arguments = Buffer.concat([
          Buffer.alloc(argumentsPadding - converted_arguments.length),
          converted_arguments,
        ]);
      }

      const encodedOpcode = [foundOpcode];
      bytesCodes = Buffer.concat([
        bytesCodes,
        Buffer.from(encodedOpcode),
        converted_arguments,
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
