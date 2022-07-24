import { Node } from './ast/Node';
import { Keyword } from './tokens/Keyword';
import { Token } from './tokens/Token';

export class Syntax {
  private tokenOrder: Array<SyntaxInput> = [];

  constructor(rootToken: Token) {
    this.tokenOrder.push(rootToken);
  }

  public then(token: SyntaxInput) {
    this.tokenOrder.push(token);
    return this;
  }

  public matches({
    tokens,
    currentIndex,
    level,
  }: {
    currentIndex: number;
    level: number;
    tokens: string[];
  }): null | [Node, number] {
    let root: Node | undefined = undefined;
    const hasValidSyntax = this.tokenOrder.every((inputItem, index) => {
      const tokenValue = tokens[currentIndex + index];

      const addNode = (node: Node) => {
        if (!root) {
          root = node;
        } else {
          root.add(node);
        }
      };

      const item = Array.isArray(inputItem) ? inputItem : [inputItem];

      const rootCopy: Node = Object.assign({}, root);
      return item.find((item) => {
        const options = this.isValidOperation({
          currentIndex: currentIndex + index,
          tokens,
          tokenValue,
          level,
          item,
        });
        if (options.isValid) {
          addNode(options.node);
          currentIndex += options.movedIndex;
          return true;
        } else {
          // revert the changes ...
          if (root) {
            Object.assign(root, rootCopy);
          }
        }
      });
    });

    if (hasValidSyntax) {
      if (root) {
        return [root, this.tokenOrder.length];
      } else {
        throw new Error('This should not happen');
      }
    } else {
      return null;
    }
  }

  private isValidOperation({
    item,
    tokens,
    tokenValue,
    currentIndex,
    level,
  }: {
    item: Union;
    tokens: string[];
    tokenValue: string;
    currentIndex: number;
    level: number;
  }):
    | {
        isValid: boolean;
        movedIndex: number;
        node: Node;
      }
    | {
        isValid: false;
      } {
    if (item instanceof Token) {
      const isKeyword = item instanceof Keyword;
      const isNotSameTokenValue = isKeyword && item.value !== tokenValue;
      const isInvalidToken = !isKeyword && !item.isValid(tokenValue);
      if (isNotSameTokenValue || isInvalidToken) {
        return {
          isValid: false,
        };
      } else {
        const NodeConstructor = item.node();
        const node = new NodeConstructor(tokenValue);

        return {
          isValid: true,
          movedIndex: 0,
          node,
        };
      }
    } else if (item instanceof Syntax) {
      const results = item.matches({
        tokens,
        currentIndex,
        level: level + 1,
      });
      if (!results) {
        return {
          isValid: false,
        };
      } else {
        const [node, movement] = results;
        return {
          isValid: true,
          movedIndex: movement - 1,
          node,
        };
      }
    } else {
      throw new Error('Not implemented');
    }
  }

  public get root(): Token {
    const value = this.tokenOrder[0];
    if (!(value instanceof Token)) {
      throw new Error('First token should always be a identifier');
    }
    return value;
  }
}

type Union = Token | Syntax;
type SyntaxInput = Array<Union> | Union;
