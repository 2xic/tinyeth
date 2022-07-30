import { Container } from 'inversify';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { ContractNode } from './ast/ContractNode';
import { FunctionNode } from './ast/FunctionNode';
import { ReturnNode } from './ast/ReturnNode';
import { VariableNode } from './ast/VariableNode';
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

    const functionNodeScopeUint8 = functionNode.nodes[0] as VariableNode;
    expect(functionNodeScopeUint8.fields.type).toBe('uint8');
    expect(functionNodeScopeUint8.fields.name).toBe('name');
    expect(functionNodeScopeUint8.fields.value).toBe('1');

    const functionNodeReturn = functionNode.nodes[1] as ReturnNode;
    expect(functionNodeReturn.fields.value).toBe('name');
  });
});
