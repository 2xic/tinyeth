import { injectable } from 'inversify';
import { MnemonicParser } from '../evm/MnemonicParser';

@injectable()
export class EvmByteCodeMacros {
  constructor(private mnemonicParser: MnemonicParser) {}

  public allocateMemory() {
    // TODO: This should be dynamic.
    return this.mnemonicParser.parse({
      script: `
            PUSH1 0x80
            PUSH1 0x40
            MSTORE
        `,
    });
  }

  public nonPayable(): Buffer {
    return this.mnemonicParser.parse({
      script: `
              CALLVALUE
              DUP1
              ISZERO
          `,
    });
  }

  public simpleRevert(): Buffer {
    return this.mnemonicParser.parse({
      script: `
                PuSH1 0x00
                DUP1
                REVERT
            `,
    });
  }

  public jumpi(fallThrough: () => Buffer, destination: number) {
    const destinationOpcodes = this.mnemonicParser.parse({
      script: `
            JUMPDEST
            POP
        `,
    });
    const falseStatement = fallThrough();
    const jumpStatement = this.mnemonicParser.parse({
      script: `
            PUSH1 0x${(
              falseStatement.length +
              destinationOpcodes.length +
              destination +
              1
            ).toString(16)}
            JUMPI
        `,
    });

    return Buffer.concat([jumpStatement, falseStatement, destinationOpcodes]);
  }
  /*
  public pop(): Buffer {
    return this.mnemonicParser.parse({
      script: `
                  POP
              `,
    });
  }
  */

  public codeCopyReturn({
    destination,
    offset,
    size,
    program,
  }: {
    destination: number;
    offset: number;
    size: number;
    program: Buffer;
  }): Buffer {
    // Special code copy!
    const codeCopy = this.mnemonicParser.parse({
      script: `
            PUSH1 ${size}
            DUP1
            `,
    });
    const codeCopy3 = this.mnemonicParser.parse({
      script: `
        PUSH1 ${destination}
        CODECOPY
        PUSH1 0x00
        RETURN
          `,
    });

    const codeCopyPart2 = this.mnemonicParser.parse({
      script: `
            PUSH1 ${offset + codeCopy.length + codeCopy3.length + 3}
        `,
    });

    return Buffer.concat([
      codeCopy,
      codeCopyPart2,
      codeCopy3,
      Buffer.from([0xfe]),
      program,
    ]);
  }
}
