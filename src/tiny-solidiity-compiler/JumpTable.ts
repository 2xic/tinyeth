import { Abi } from '../evm';
import { MnemonicParser } from '../evm/MnemonicParser';
import { SimpleBuffers } from '../utils/SimpleBuffers';

export class JumpTable {
  private functions: Array<
    [string, (options: BuildFunctionOptions) => Buffer]
  > = [];

  public add({
    name,
    functionCode,
  }: {
    name: string;
    functionCode: (options: BuildFunctionOptions) => Buffer;
  }) {
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

      const simpleBuffer = new SimpleBuffers();
      simpleBuffer.concat(extra);
      simpleBuffer.concat(
        new MnemonicParser().parse({
          script: `
        PUSH1 ${length + extra.length + 2 + revert.length}
      `,
        })
      );
      simpleBuffer.concat(revert);
      simpleBuffer.concat(
        new MnemonicParser().parse({
          script: 'JUMPDEST',
        })
      );
      simpleBuffer.concat(
        this.functions[0][1]({
          length: simpleBuffer.length,
        })
      );

      return simpleBuffer.build();
    } else {
      throw new Error('Not implemented');
    }
  }
}

interface BuildFunctionOptions {
  length: number;
}
