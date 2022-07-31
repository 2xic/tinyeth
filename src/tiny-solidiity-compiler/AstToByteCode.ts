import { injectable } from 'inversify';
import { MnemonicParser } from '../evm/MnemonicParser';
import { SimpleBuffers } from '../utils/SimpleBuffers';
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
          functionCode: ({ length }) => this.compileFunction({ node, length }),
        });
      } else {
        throw new Error('Not supported.');
      }
    }

    output = Buffer.concat([output, jumpTable.construct(output.length)]);

    return output;
  }

  private compileFunction({
    node,
    length,
  }: {
    node: FunctionNode;
    length: number;
  }): Buffer {
    const bufferOutput = new SimpleBuffers();
    if (node.fields.modifier !== 'payable') {
      bufferOutput.concat(this.evmByteCodeMacros.nonPayable());
      bufferOutput.concat(
        this.evmByteCodeMacros.jumpi(
          () => this.evmByteCodeMacros.simpleRevert(),
          length + bufferOutput.length + 5
        )
      );
    }

    for (const child of node.nodes) {
      /*
        - This should be more strict
          - view = no change to change
          - Pure = no interaction with state
          - Payable = allow state changes
          - Support custom modifiers.
      */
      if (child instanceof ReturnNode) {
        if (child.isValue) {
          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
              PUSH1 0x1
              PUSH1 0x0
              MSTORE
              PUSH1 32
              PUSH1 0x0
              return
            `,
            })
          );
        } else {
          throw new Error('We don`t support variables yet sir.');
        }

        return bufferOutput.build();
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
    // program.operation((item) => item.pop());

    program.operation((item, size) => {
      const program = inputProgram;
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
