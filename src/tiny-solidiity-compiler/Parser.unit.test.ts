/* eslint-disable @typescript-eslint/no-empty-function */
import { Container } from 'inversify';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { ConditionalInputVariables } from './ast/ConditionalInputVariables';
import { ConditionalNode } from './ast/ConditionalNode';
import { ContractNode } from './ast/ContractNode';
import { FunctionNode } from './ast/FunctionNode';
import { ReturnNode } from './ast/ReturnNode';
import { VariableNode } from './ast/VariableNode';
import { UndeclaredVariableError } from './errors/UndeclaredVariableError';
import { Parser } from './Parser';

describe('Parser', () => {
  let container: Container;
  let parser: Parser;

  beforeEach(() => {
    container = new UnitTestContainer().create();
    parser = container.get(Parser);
  });

  it('should correctly construct a simple ast tree', () => {
    const simpleSolidity = `
        contract EmptyContract {}
    `;

    const tree = parser.parse({ input: simpleSolidity });
    expect(tree).toBeTruthy();
  });

  it('should correctly construct a ast tree with variables', () => {
    const simpleSolidity = `
        contract VariableContract {
          uint8 public name;
        }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    expect(tree).toBeTruthy();

    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('VariableContract');

    const variableNode = tree.nodes[0] as VariableNode;
    expect(variableNode).toBeInstanceOf(VariableNode);
    expect(variableNode.fields.type).toBe('uint8');
    expect(variableNode.fields.name).toBe('name');
    expect(variableNode.fields.access).toBe('public');
  });

  it('should correctly construct a ast tree with private access modifiers', () => {
    const simpleSolidity = `
        contract VariableContract {
          uint8 private name;
        }
    `;

    const tree = parser.parse({ input: simpleSolidity });

    if (!tree) {
      throw new Error('Error');
    }

    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('VariableContract');

    const variableNode = tree.nodes[0] as VariableNode;
    expect(variableNode).toBeInstanceOf(VariableNode);
    expect(variableNode.fields.type).toBe('uint8');
    expect(variableNode.fields.name).toBe('name');
    expect(variableNode.fields.access).toBe('private');
  });

  it('should correctly construct a ast tree with multiple variables', () => {
    const simpleSolidity = `
        contract VariableContract {
          uint8 public name;

          uint8 private name;
        }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    expect(tree).toBeTruthy();
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('VariableContract');

    const publicVariableNode = tree.nodes[0] as VariableNode;
    expect(publicVariableNode).toBeInstanceOf(VariableNode);
    expect(publicVariableNode.fields.type).toBe('uint8');
    expect(publicVariableNode.fields.name).toBe('name');
    expect(publicVariableNode.fields.access).toBe('public');

    const privateVariableNode = tree.nodes[1] as VariableNode;
    expect(privateVariableNode).toBeInstanceOf(VariableNode);
    expect(privateVariableNode.fields.type).toBe('uint8');
    expect(privateVariableNode.fields.name).toBe('name');
    expect(privateVariableNode.fields.access).toBe('private');
  });

  it('should correctly construct a ast tree for a pure function', () => {
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public pure returns (uint8) {
        return 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
  });

  it('should correctly construct a ast tree for a pure function with a variable', () => {
    const simpleSolidity = `
    contract SimpleContract {
      uint8 public name;

      function return1() public pure returns (uint8) {
        return 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const variableNode = contractNode.nodes[0] as VariableNode;
    expect(variableNode.fields.type).toBe('uint8');

    const functionNode = contractNode.nodes[1] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
  });

  it('should correctly parse comments', () => {
    const simpleSolidity = `
    contract SimpleContract {
      uint8 public name;

      /*
      function return1() public pure returns (uint8) {
        return 1;
      }
      */

      // this is a test

      uint8 public name;

      function return1() public pure returns (uint8) {
        return 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const firstVariableNode = contractNode.nodes[0] as VariableNode;
    expect(firstVariableNode.fields.type).toBe('uint8');

    const secondVariableNode = contractNode.nodes[1] as VariableNode;
    expect(secondVariableNode.fields.type).toBe('uint8');

    const functionNode = contractNode.nodes[2] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
  });

  it('should correctly parse variables inside functions', () => {
    /**
     * How should this be interpreted ?
     *  I think this way to visualize it makes it better, and cleaner
     *        contract node (name field)
     *          /
     *        function node (name, returns field)
     *        /
     *       variable_1 (type, name, value field)
     *      /
     *      return_1 (name field)
     *  Currently add values are added as a child to a root node.
     *  The root node should be the name of the Node.
     *  ReturnNode for instance.
     */
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public pure returns (uint8) {
        uint8 name = 1;
        return name;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
    expect(functionNode.fields.modifier).toBe('pure');

    const functionNodeScopeUint8 = functionNode.nodes[0] as VariableNode;
    expect(functionNodeScopeUint8.fields.type).toBe('uint8');
    expect(functionNodeScopeUint8.fields.name).toBe('name');
    expect(functionNodeScopeUint8.fields.value).toBe('1');

    const functionNodeReturn = functionNode.nodes[1] as ReturnNode;
    expect(functionNodeReturn.fields.value).toBe('name');
  });

  it('should correctly construct a ast tree when function has no modifiers specified', () => {
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public returns (uint8) {
        return 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
  });

  it('should correctly construct a ast tree when function has payable modifier', () => {
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public payable returns (uint8) {
        return 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');
    expect(functionNode.fields.modifier).toBe('payable');
  });

  it('should correctly construct a ast tree when function returns nothing', () => {
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public {
        uint8 name = 1;
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');

    const variableNode = functionNode.nodes[0] as VariableNode;
    expect(variableNode.fields.name).toBe('name');
  });

  it('should correctly construct a ast tree with conditional nodes', () => {
    const simpleSolidity = `
    contract SimpleContract {
      function return1() public {
        if (true) {
          return 1;
        } else if (1 == 2) {
          return 0;
        } else {
          return 1;
        }
      }
    }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');

    const firstConditionalNode = functionNode.nodes[0] as ConditionalNode;
    expect(firstConditionalNode).toBeInstanceOf(ConditionalNode);
    expect(
      ((firstConditionalNode.nodes[0] as VariableNode).fields as any).variable
    ).toBe('true');

    // TODO: Reflect, should it be a child, or not ?
    const secondConditionalNode = firstConditionalNode
      .nodes[2] as ConditionalNode;
    expect(secondConditionalNode).toBeInstanceOf(ConditionalNode);
    expect(
      (
        (secondConditionalNode.nodes[0] as ConditionalInputVariables)
          .fields as any
      ).variable1
    ).toBe('1');
    expect(
      (
        (secondConditionalNode.nodes[0] as ConditionalInputVariables)
          .fields as any
      ).variable2
    ).toBe('2');
    expect(
      (
        (secondConditionalNode.nodes[0] as ConditionalInputVariables)
          .fields as any
      ).operator
    ).toBe('==');

    const thirdConditionalNode = secondConditionalNode
      .nodes[2] as ConditionalNode;
    expect(thirdConditionalNode).toBeInstanceOf(ConditionalNode);
  });

  it('should correctly construct a ast tree with a if conditional nodes', () => {
    const simpleSolidity = `
      contract SimpleContract {
        function return1() public {
          if (1 == 2){
            // ok
          }
        }
      }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    const contractNode = tree as ContractNode;
    expect(contractNode).toBeInstanceOf(ContractNode);
    expect(contractNode.fields.name).toBe('SimpleContract');

    const functionNode = contractNode.nodes[0] as FunctionNode;
    expect(functionNode.fields.name).toBe('return1');

    const firstConditionalNode = functionNode.nodes[0] as ConditionalNode;
    expect(firstConditionalNode).toBeInstanceOf(ConditionalNode);
  });

  it('should throw an parsing error on invalid syntax', () => {
    expect(() =>
      parser.parse({
        input: `
      function return1() public {
        if (true) {
          return 1;
        } else {
          return 0;
        }
      }
    `,
      })
    ).toThrowError();

    expect(() =>
      parser.parse({
        input: `
        contract SimpleContract {
          function return1() public {
            else {
              return 0;
            }
          }
        }
  `,
      })
    ).toThrowError();

    expect(() =>
      parser.parse({
        input: `
        contract SimpleContract {
          function return1() public {
            if {
              return 0;
            }
          }
        }
  `,
      })
    ).toThrowError();

    expect(() =>
      parser.parse({
        input: `
        contract SimpleContract 
  `,
      })
    ).toThrowError();
  });

  it('should correctly deal with if and else', () => {
    expect(() =>
      parser.parse({
        input: `
      contract SimpleContract {
        function return1() public {
          if (2 == 1) {
            return 0;
          } else {
            // ok
          }
        }
      }
`,
      })
    ).not.toThrowError(UndeclaredVariableError);
  });

  it('should correctly make sure a variable is decelerated', () => {
    expect(() =>
      parser.parse({
        input: `
      contract SimpleContract {
        function return1() public {
          // name is not decelerated ...
          if (name == 1) {
            return 0;
          } else {
            // ok
          }
        }
      }
`,
      })
    ).toThrowError(UndeclaredVariableError);
  });

  it.skip('should be able to allocate storage and update variables', () => {});

  it.skip('should be able to preform if conditions with variables', () => {});
});
3