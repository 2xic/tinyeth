import { BindingScopeEnum, Container } from 'inversify';
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
        contract EmptyContract {
          uint8 public name;
        }
    `;

    const tree = parser.parse({ input: simpleSolidity });
    if (!tree) {
      throw new Error('Error');
    }
    expect(tree).toBeTruthy();
    expect(tree.nodes[0]).toBeInstanceOf(VariableNode);
    expect(tree.nodes[0].value).toBe('EmptyContract');

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
});
