import { KeywordNode } from './ast/KeywordNode';
import { Node } from './ast/Node';
import { RecursiveSyntax } from './RecursiveSyntax';
import { Keyword } from './tokens/Keyword';
import { StopToken } from './tokens/StopToken';
import { Token } from './tokens/Token';

export class Syntax {
  private tokenOrder: Array<SyntaxInput | RecursiveSyntax> = [];

  constructor(rootToken: Token) {
    this.tokenOrder.push(rootToken);
  }

  public then(token: SyntaxInput) {
    this.tokenOrder.push(token);
    return this;
  }

  public thenRecursive(token: Syntax | Syntax[], stopToken: Token) {
    this.tokenOrder.push(new RecursiveSyntax(token, stopToken));
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
    let movement = 0;
    const hasValidSyntax = this.tokenOrder.every((inputItem, index) => {
      const addNode = (node: Node) => {
        if (!root) {
          root = node;
        } else {
          root.add(node);
        }
      };

      const rootItems = Array.isArray(inputItem) ? inputItem : [inputItem];

      const rootCopy: Node = Object.assign({}, root);
      return rootItems.find((rootItem) => {
        let shouldRun = true;
        const copiedCurrentIndex = currentIndex;
        while (shouldRun) {
          let convertedItem;
          const tokenValue = tokens[currentIndex + index];

          if (rootItem instanceof RecursiveSyntax) {
            convertedItem = rootItem.recursiveToken;
            /*
            console.log([rootItem.breakRecursion, tokenValue]);
            console.log(rootItem.breakRecursion.isValid(tokenValue));*/
            if (rootItem.breakRecursion.isValid(tokenValue)) {
              addNode(new KeywordNode(tokenValue));
              movement++;
              break;
            }
          } else {
            convertedItem = rootItem;
          }

          // TODO: this should probably not be recursive at this level.
          const items = Array.isArray(convertedItem)
            ? convertedItem
            : [convertedItem];

          console.log([tokenValue, rootItem, currentIndex + index, level]);
          let noMatch = true;
          items.find((item) => {
            const options = this.isValidOperation({
              currentIndex: currentIndex + index,
              tokens,
              tokenValue,
              level,
              item,
            });
            if (options.isValid) {
              movement++;
              addNode(options.node);
              currentIndex += options.movedIndex;
              if (!(rootItem instanceof RecursiveSyntax)) {
                return true;
              } else {
                currentIndex += 1;
              }
              noMatch = false;
            } else {
              // revert the changes ...
              if (!(rootItem instanceof RecursiveSyntax)) {
                if (root) {
                  Object.assign(root, rootCopy);
                  currentIndex = copiedCurrentIndex;
                  shouldRun = false;
                } else {
                  shouldRun = false;
                }
                return true;
              }
            }
          });
          if (noMatch) {
            break;
          }
        }
        return shouldRun;
      });
    });

    if (hasValidSyntax) {
      if (root) {
        return [root, movement]; // this.tokenOrder.length];
      } else {
        console.log(tokens);
        console.log(currentIndex);
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
        console.log([level, movement]);
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
