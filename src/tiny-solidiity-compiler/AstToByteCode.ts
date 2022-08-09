import { injectable } from 'inversify';
import { MnemonicParser } from '../evm/MnemonicParser';
import { SimpleBuffers } from '../utils/SimpleBuffers';
import { FunctionNode } from './ast/FunctionNode';
import { ReturnNode } from './ast/ReturnNode';
import { VariableNode } from './ast/VariableNode';
import { VariableOperatorNode } from './ast/VariableOperatorNode';
import { EvmByteCodeMacros } from './EvmBytecodeMacros';
import { EvmProgram } from './EvmProgram';
import { JumpTable } from './JumpTable';
import { Parser } from './Parser';
import { VariableTable } from './VariableTable';

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
    const variableTable = new VariableTable();

    // Should probably be a tree search.
    for (const node of tree.nodes) {
      if (node instanceof FunctionNode) {
        jumpTable.add({
          name: node.fieldValues.name,
          functionCode: ({ length }) =>
            this.compileFunction({ variableTable, node, length }),
        });
      } else if (node instanceof VariableNode) {
        variableTable.add({
          name: node.fields.name,
        });
      } else {
        throw new Error(`Not supported. ${node}`);
      }
    }

    output = Buffer.concat([output, jumpTable.construct(output.length)]);

    return output;
  }

  private compileFunction({
    node,
    length,
    variableTable,
  }: {
    node: FunctionNode;
    length: number;
    variableTable: VariableTable;
  }): Buffer {
    const bufferOutput = new SimpleBuffers();
    if (node.fields.modifier !== 'payable') {
      bufferOutput.concat(this.evmByteCodeMacros.nonPayable());
      bufferOutput.concat(
        this.evmByteCodeMacros.jumpi(
          () => this.evmByteCodeMacros.simpleRevert(),
          length + bufferOutput.length // + 5
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
          // TODO: This should check for the type before the PUSH
          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
              PUSH1 ${child.fields.value}
              PUSH1 0x0
              MSTORE
              PUSH1 32
              PUSH1 0x0
              return
            `,
            })
          );
        } else {
          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
              PUSH1 ${variableTable.getSlot({ name: child.fields.value })}
              SLOAD
              PUSH1 0x0
              MSTORE
              PUSH1 32
              PUSH1 0x0
              return
            `,
            })
          );
        }

        return bufferOutput.build();
      } else if (child instanceof VariableOperatorNode) {
        // This can be moved to another function.
        // In addition += -> is the add operator
        // The same logic for loading and storing will be the same for all operators.
        // So this logic should be in the macro.
        if (child.fields.operator == '+=') {
          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
                PUSH1 ${variableTable.getSlot({ name: child.fields.name })}
                SLOAD
                PUSH1 ${child.fields.value}
                ADD
                PUSH1 $${variableTable.getSlot({ name: child.fields.name })}
                SSTORE
              `,
            })
          );
        } else {
          throw new Error('Unknown operator');
        }
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
