import { Abi } from '../evm';
import { MnemonicParser } from '../evm/MnemonicParser';

export class JumpTable {
  private functions: Array<[string, Buffer]> = [];

  public add({ name, functionCode }: { name: string; functionCode: Buffer }) {
    this.functions.push([name, functionCode]);
  }

  public construct(length: number): Buffer {
    if (this.functions.length === 1) {
      const extra = new MnemonicParser().parse({
        script: `
        PUSH1 0x00
        CALLDATALOAD 
        PUSH1 0xe0
        SHR 
        DUP1 
        PUSH4 0x${new Abi().encodeFunction(this.functions[0][0])}
        EQ
      `,
      });
      const revert = new MnemonicParser().parse({
        script: `
          JUMPI 
          JUMPDEST 
              // this should be handled by global fallback.
              PUSH1 0x00
              DUP1 
              REVERT
        `,
      });

      return Buffer.concat([
        extra,
        new MnemonicParser().parse({
          script: `
          PUSH1 ${length + extra.length + 2 + revert.length}
        `,
        }),
        revert,
        new MnemonicParser().parse({
          script: 'JUMPDEST',
        }),
        this.functions[0][1],
      ]);
    } else {
      throw new Error('Not implemented');
    }
  }
}
