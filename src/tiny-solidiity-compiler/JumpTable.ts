import { Abi, FunctionTypes } from '../evm';
import { MnemonicParser } from '../evm/MnemonicParser';
import { SimpleBuffers } from '../utils/SimpleBuffers';

export class JumpTable {
  private functions: Array<
    [FunctionDefinition, (options: BuildFunctionOptions) => Buffer]
  > = [];

  public add({
    functionDefinition,
    functionCode,
  }: {
    functionDefinition: FunctionDefinition;
    functionCode: (options: BuildFunctionOptions) => Buffer;
  }) {
    this.functions.push([functionDefinition, functionCode]);
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

    // jump back to start.
    // -2 because of the push instruction.
    const revertIndex = length + invalidFunctionRevert.length - 2;

    if (this.functions.length === 1) {
      const buffer = this.constructFunctionCall({
        length: simpleBuffer.length + length,
        fallThroughIndex: revertIndex,
        item: this.functions[0],
      });
      simpleBuffer.concat(buffer);
      return simpleBuffer.build();
    } else {
      const firstFunction = this.constructFunctionCall({
        length: simpleBuffer.length + length,
        fallThroughIndex: (index) => index,
        item: this.functions[0],
      });

      simpleBuffer.concat(firstFunction);

      this.functions.slice(1, this.functions.length - 1).forEach((item) => {
        simpleBuffer.concat(
          this.constructFunctionCall({
            length: simpleBuffer.length + length,
            fallThroughIndex: (index) => index,
            item,
          })
        );
      });

      const lastFunction = this.constructFunctionCall({
        length: simpleBuffer.length + length,
        // The last function should always revert if no other instructions are there.
        fallThroughIndex: revertIndex,
        item: this.functions[this.functions.length - 1],
      });

      simpleBuffer.concat(lastFunction);

      return simpleBuffer.build();
    }
  }

  private constructFunctionCall({
    length,
    item,
    fallThroughIndex,
  }: {
    item: [FunctionDefinition, (options: BuildFunctionOptions) => Buffer];
    length: number;
    fallThroughIndex: number | ((index: number) => number);
  }) {
    const createBuffer = (fallThroughIndexValue: number) => {
      const simpleBuffer = new SimpleBuffers();

      const functionCheck = this.addFunctionCheck(item[0]);

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

    const calculatedFallThroughINdex =
      typeof fallThroughIndex === 'number'
        ? fallThroughIndex
        : // TODO: This will be replaced by the dynamic push buffer
          // This should be the length + the size of the current function.
          fallThroughIndex(length + createBuffer(0).length);

    const simpleBuffer = createBuffer(calculatedFallThroughINdex);

    return simpleBuffer.build();
  }

  private addFunctionCheck(functionDefinition: FunctionDefinition) {
    // TODO: You don't need to recall this, you can store the value on the stack with DUP1
    return new MnemonicParser().parse({
      script: `
        JUMPDEST
        PUSH1 0x00
        CALLDATALOAD 
        PUSH1 0xe0
        SHR 
        DUP1 
        PUSH4 0x${new Abi().encodeFunction(
          // TODO: this should consider the arguments
          functionDefinition.name
        )}
        EQ
    `,
    });
  }
}

interface BuildFunctionOptions {
  length: number;
}

interface FunctionDefinition {
  name: string;
  arguments?: FunctionTypes[];
}
