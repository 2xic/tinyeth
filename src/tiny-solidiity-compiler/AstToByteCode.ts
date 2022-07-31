/*
Just some thoughts, implementation over the next few days
- Need to construct a jump table
    - We start with a simple empty contract
    - Then add one function
- I think we should try to match the solc compiler output, at least use it for reference.

- I think we can create small macros of evm code, and map that to functions.

*/

import { injectable } from 'inversify';
import { MnemonicParser } from '../evm/MnemonicParser';
import { FunctionNode } from './ast/FunctionNode';
import { ReturnNode } from './ast/ReturnNode';
import { EvmByteCodeMacros } from './EvmBytecodeMacros';
import { EvmProgram } from './EvmProgram';
import { JumpTable } from './JumpTable';
import { Parser } from './Parser';

@injectable()
export class AstToByteCode {
  constructor(
    private parser: Parser,
    private evmProgram: EvmProgram,
    private evmByteCodeMacros: EvmByteCodeMacros,
    private mnemonicParser: MnemonicParser
  ) {}

  public compile({ script }: { script: string }): Buffer {
    const tree = this.parser.parse({
      input: script,
    });
    if (!tree) {
      throw new Error('Invalid!');
    }
    let output = this.evmByteCodeMacros.allocateMemory();
    const jumpTable = new JumpTable();

    // Should probably be a tree search.
    for (const node of tree.nodes) {
      if (node instanceof FunctionNode) {
        jumpTable.add({
          name: node.fieldValues.name,
          functionCode: this.compileFunction({ node }),
        });
      } else {
        throw new Error('Not supported.');
      }
    }

    output = Buffer.concat([output, jumpTable.construct(output.length)]);

    return output;
  }

  private compileFunction({ node }: { node: FunctionNode }): Buffer {
    for (const child of node.nodes) {
      /*
        - This should be more strict
          - view = no change to change
          - Pure = no interaction with state
          - Payable = allow state changes
          - Support custom modifiers.
      */
      if (child instanceof ReturnNode) {
        let bufferOutput = Buffer.alloc(0);
        // TODO: This should ideally check if the value is a variable or not.
        //      numeric values are never variables.
        if (child.fields.value === '1') {
          bufferOutput = this.mnemonicParser.parse({
            script: `
              PUSH1 0x1
              PUSH1 0x0
              MSTORE
              PUSH1 32
              PUSH1 0x0
              return
            `,
          });
        }
        return bufferOutput;
      } else {
        throw new Error('Unknown node');
      }
    }
    throw new Error('Should not happen');
  }

  public deployment({ program: inputProgram }: { program: Buffer }): Buffer {
    const program = this.evmProgram.buildProgram();

    program.operation((item) => item.allocateMemory());
    program.operation((item) => item.nonPayable());
    program.operation((item, size) => {
      return item.jumpi(() => item.simpleRevert(), size);
    });
    // Pop of the payment value
    //  program.operation((item) => item.pop());
    program.operation((item, size) => {
      // cheating, but this should just be the output contract.
      // currently looking at deployment
      const program = inputProgram; //getBufferFromHex(script);
      /* getBufferFromHex(
        '0x6080604052600080fdfea264697066735822122062b37c2f49de67be4e4e8d8e912267eeef2505297138bd257fd40fe4e97a2d1064736f6c634300080f0033'
      );
      */
      return item.codeCopyReturn({
        program,
        destination: 0,
        offset: size,
        size: program.length,
      });
    });

    return program.output;
  }
}
