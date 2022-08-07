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
    const simpleBuffer = new SimpleBuffers();
    const invalidFunctionRevert = new MnemonicParser().parse({
      script: `
          JUMPDEST 
            // this should be handled by global fallback.
            PUSH1 0x00
            DUP1 
            REVERT
      `,
    });
    simpleBuffer.concat(
      new MnemonicParser().parse({
        script: `
          PUSH1 ${invalidFunctionRevert.length + length + 2 + 1}
          JUMP
      `,
      })
    );
    simpleBuffer.concat(invalidFunctionRevert);

    if (this.functions.length === 1) {
      const buffer = this.constructFunctionCall({
        length: simpleBuffer.length + length,
        fallThroughIndex: length + invalidFunctionRevert.length - 2,
        item: this.functions[0],
      });
      simpleBuffer.concat(buffer);
      return simpleBuffer.build();
    } else {
      const function1 = this.constructFunctionCall({
        length: simpleBuffer.length + length,
        fallThroughIndex: (index) => index + length,
        item: this.functions[0],
      });

      const function2 = this.constructFunctionCall({
        length: simpleBuffer.length + function1.length + length,
        fallThroughIndex: length + invalidFunctionRevert.length - 2,
        item: this.functions[1],
      });

      simpleBuffer.concat(function1);
      simpleBuffer.concat(function2);

      return simpleBuffer.build();
    }
  }

  private constructFunctionCall({
    length,
    item,
    fallThroughIndex,
  }: {
    item: [string, (options: BuildFunctionOptions) => Buffer];
    length: number;
    fallThroughIndex: number | ((index: number) => number);
  }) {
    const createBuffer = (fallThroughIndexValue: number) => {
      const simpleBuffer = new SimpleBuffers();

      const functionCheck = this.addFunctionCheck({
        name: item[0],
      });

      simpleBuffer.concat(functionCheck);

      const simpleRevert = new MnemonicParser().parse({
        script: `
            JUMPI
              PUSH1 ${fallThroughIndexValue}
              JUMP
          `,
      });

      simpleBuffer.concat(
        new MnemonicParser().parse({
          script: `
              PUSH1 ${length + functionCheck.length + simpleRevert.length + 2}
            `,
        })
      );
      simpleBuffer.concat(simpleRevert);

      simpleBuffer.concat(
        new MnemonicParser().parse({
          script: 'JUMPDEST',
        })
      );

      simpleBuffer.concat(
        item[1]({
          length: length + simpleBuffer.length,
        })
      );

      return simpleBuffer;
    };

    const simpleBuffer = createBuffer(
      typeof fallThroughIndex === 'number'
        ? fallThroughIndex
        : // TODO: This will be replaced by the dynamic push buffer
          fallThroughIndex(length + createBuffer(0).length - 1) - 4
    );

    return simpleBuffer.build();
  }

  private addFunctionCheck({ name }: { name: string }) {
    // TODO: You don't need to recall this, you can store the value on the stack with DUP1
    return new MnemonicParser().parse({
      script: `
        JUMPDEST
        PUSH1 0x00
        CALLDATALOAD 
        PUSH1 0xe0
        SHR 
        DUP1 
        PUSH4 0x${new Abi().encodeFunction(name)}
        EQ
    `,
    });
  }
}

interface BuildFunctionOptions {
  length: number;
}
