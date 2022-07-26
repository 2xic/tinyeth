import { Container } from 'inversify';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { KeywordNode } from './ast/KeywordNode';
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
    expect(tree.nodes[0]).toBeInstanceOf(VariableNode);
    expect(tree.nodes[0].value).toBe('VariableContract');

    expect(tree.nodes[1]).toBeInstanceOf(KeywordNode);
    const scope = tree.nodes[1];

    // TODO: is this actually needed ?
    expect(scope.value).toBe('{');
    expect(scope.nodes[1].value).toBe('}');

    const uint8 = scope.nodes[0];
    expect(uint8.value).toBe('uint8');
    expect(uint8.nodes[0].value).toBe('public');
    expect(uint8.nodes[1].value).toBe('name');
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

    expect(tree).toBeTruthy();
    expect(tree.nodes[0]).toBeInstanceOf(VariableNode);
    expect(tree.nodes[0].value).toBe('VariableContract');

    expect(tree.nodes[1]).toBeInstanceOf(KeywordNode);
    const scope = tree.nodes[1];

    // TODO: is this actually needed ?
    expect(scope.value).toBe('{');
    expect(scope.nodes[1].value).toBe('}');

    const uint8 = scope.nodes[0];
    expect(uint8.value).toBe('uint8');
    expect(uint8.nodes[0].value).toBe('private');
    expect(uint8.nodes[1].value).toBe('name');
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
    expect(tree.nodes[0]).toBeInstanceOf(VariableNode);
    expect(tree.nodes[0].value).toBe('VariableContract');

    expect(tree.nodes[1]).toBeInstanceOf(KeywordNode);
    const scope = tree.nodes[1];

    // TODO: is this actually needed ?
    expect(scope.value).toBe('{');
    expect(scope.nodes[2].value).toBe('}');

    const publicUint8 = scope.nodes[0];
    expect(publicUint8.value).toBe('uint8');
    expect(publicUint8.nodes[0].value).toBe('public');
    expect(publicUint8.nodes[1].value).toBe('name');

    const privateUint8 = scope.nodes[1];
    expect(privateUint8.value).toBe('uint8');
    expect(privateUint8.nodes[0].value).toBe('private');
    expect(privateUint8.nodes[1].value).toBe('name');
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
    expect(tree).toBeTruthy();
    expect(tree.nodes[0]).toBeInstanceOf(VariableNode);
    expect(tree.nodes[0].value).toBe('SimpleContract');

    const scope = tree.nodes[1];
    expect(scope.value).toBe('{');

    const functionNode = scope.nodes[0];
    expect(functionNode.value).toBe('function');
    expect(functionNode.value).toBe('function');
  });
});
