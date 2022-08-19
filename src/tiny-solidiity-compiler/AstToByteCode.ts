import { injectable } from 'inversify';
import { MnemonicParser } from '../evm/MnemonicParser';
import { SimpleBuffers } from '../utils/SimpleBuffers';
import { ConditionalInputVariables } from './ast/ConditionalInputVariables';
import { ConditionalNode } from './ast/ConditionalNode';
import { FunctionNode } from './ast/FunctionNode';
import { Node } from './ast/Node';
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
    const output = new SimpleBuffers();
    output.concat(this.evmByteCodeMacros.allocateMemory());

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

    output.concat(jumpTable.construct(output.length));

    return output.build();
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
          length + bufferOutput.length
        )
      );
    }

    for (const child of node.nodes) {
      this.convertNodeToByteCode({
        parentNode: node,
        child,
        bufferOutput,
        variableTable,
      });
    }

    return bufferOutput.build();
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

  private convertNodeToByteCode({
    parentNode,
    child,
    bufferOutput,
    variableTable,
  }: {
    parentNode: Node;
    child: Node;
    bufferOutput: SimpleBuffers;
    variableTable: VariableTable;
  }) {
    /*
        - This should be more strict
          - view = no change to change
          - Pure = no interaction with state
          - Payable = allow state changes
          - Support custom modifiers.
        TODO: Reflect maybe this (^) should instead be in the parser ? 
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

      //      return bufferOutput.build();
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
        throw new Error(`Unknown operator (${child.fields.operator})`);
      }
    } else if (child instanceof ConditionalNode) {
      // TODO: Add a resolver to convert from storage variables (currently only supporting values)
      const innerNode = child.nodes[0];
      const conditionalInputVariables =
        innerNode instanceof ConditionalInputVariables
          ? innerNode.getVariables()
          : null;

      if (!conditionalInputVariables) {
        this.convertNodeToByteCode({
          parentNode: child,
          child: child.nodes[0],
          bufferOutput,
          variableTable,
        });
      } else {
        const { variable1, variable2, operator } = conditionalInputVariables;

        if (operator === '==') {
          const childBuffer = new SimpleBuffers();
          // innfer - if
          this.convertNodeToByteCode({
            parentNode: child,
            child: child.nodes[1],
            bufferOutput: childBuffer,
            variableTable,
          });

          const elseBuffer = new SimpleBuffers();
          // else
          this.convertNodeToByteCode({
            parentNode: child,
            child: child.nodes[2],
            bufferOutput: elseBuffer,
            variableTable,
          });

          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
                    PUSH1 ${variable1}
                    PUSH1 ${variable2}
                    EQ
                    PC
                    PUSH1 ${childBuffer.length + 5}
                    ADD
                    JUMPI
              `,
            })
          );
          bufferOutput.concat(elseBuffer.build());

          bufferOutput.concat(
            this.mnemonicParser.parse({
              script: `
                JUMPDEST
              `,
            })
          );

          bufferOutput.concat(childBuffer.build());
        } else {
          throw new Error(`Unknown operator (${operator})`);
        }
      }
    } else {
      throw new Error(
        `Unknown node ${parentNode.constructor.name} -> ${child.constructor.name}`
      );
    }
  }
}
