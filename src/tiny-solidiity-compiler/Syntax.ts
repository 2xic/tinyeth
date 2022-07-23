import { Node } from './ast/Node';
import { Keyword } from './tokens/Keyword';
import { Token } from './tokens/Token';

export class Syntax {
  private tokenOrder: Array<SyntaxInput> = [];

  constructor(rootToken: Token) {
    this.tokenOrder.push(rootToken);
  }

  public matches({
    tokens,
    currentIndex,
    level,
    build,
  }: {
    currentIndex: number;
    level: number;
    tokens: string[];
    build: ({
      tokens,
      currentIndex,
      level,
    }: {
      tokens: string[];
      currentIndex: number;
      level: number;
    }) => Node | null;
  }): null | [Node, number] {
    let root: Node | undefined = undefined;
    const hasValidSyntax = this.tokenOrder.every((item, index) => {
      const tokenValue = tokens[currentIndex + index];
      const isValidOperation = (item: Union) => {
        if (item instanceof Token) {
          if (item instanceof Keyword && item.value !== tokenValue) {
            return false;
          } else if (!(item instanceof Keyword) && !item.isValid(tokenValue)) {
            return false;
          } else {
            if (index == 0) {
              const constructor = item.node();
              root = new constructor(tokenValue);
            } else if (root) {
              const constructor = item.node();
              const node = new constructor(tokenValue);
              root.add(node);
            }
            return true;
          }
        } else if (item instanceof Syntax) {
          const results = item.matches({
            tokens,
            currentIndex: currentIndex + index,
            level: level + 1,
            build,
          });
          if (!results) {
            return false;
          } else {
            const [node, movement] = results;
            root?.add(node);
            currentIndex += movement - 1;
            return true;
          }
        } else {
          throw new Error('Not implemented');
        }
      };
      if (Array.isArray(item)) {
        const rootCopy: Node = Object.assign({}, root);
        return item.find((item) => {
          if (isValidOperation(item)) {
            return true;
          } else {
            if (root) {
              Object.assign(root, rootCopy);
            }
          }
        });
      } else {
        return isValidOperation(item);
      }
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

  public then(token: SyntaxInput) {
    this.tokenOrder.push(token);
    return this;
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
