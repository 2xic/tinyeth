import { makeArray } from '../network/utils/makeArray';
import { KeywordNode } from './ast/KeywordNode';
import { Node } from './ast/Node';
import { RecursiveSyntax } from './RecursiveSyntax';
import { Keyword } from './tokens/Keyword';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from './tokens/Token';
import { TokenName } from './tokens/TokenName';
import { EmptySyntax } from './EmptySyntax';
import { Syntax, Union } from './Syntax';

export class SyntaxMatch {
  public matches({
    syntax,
    tokens,
    currentIndex,
    level,
    parent,
    variableScopes,
  }: {
    syntax: Syntax;
    currentIndex: number;
    level: number;
    tokens: string[];
    parent: null | Node;
    variableScopes: Record<string, string[]>;
  }): null | {
    root?: Node;
    movement: number;
    fieldValues: Record<string, string>;
  } {
    let root: Node | undefined;
    let fieldValues: Record<string, string> = {};

    let movement = 0;

    const hasValidSyntax = syntax.tokenOrder.every((inputItem, index) => {
      const addNode = (node: Node) => {
        if (!root) {
          root = node;
        } else {
          root.add(node);
        }
      };

      const rootCopy: Node = Object.assign({}, root);

      return makeArray(inputItem).find((rootItem) => {
        let shouldRun = true;
        const copiedCurrentIndex = currentIndex;
        while (shouldRun) {
          let convertedItem: Syntax | EmptySyntax;
          const tokenValue = tokens[currentIndex + index];

          if (rootItem instanceof RecursiveSyntax) {
            convertedItem = rootItem.recursivePaths;
            if (rootItem.breakRecursion.isValid(tokenValue)) {
              if (!parent) {
                throw new Error(
                  'should not be able to break out of recursion without a parent item.'
                );
              }
              root?.add(new KeywordNode(tokenValue));
              movement++;
              break;
            }
          } else {
            convertedItem = rootItem;
          }

          // TODO: this should probably not be recursive at this level.
          const items = makeArray<RequiredSyntax | Syntax | Token>(
            convertedItem
          );

          let noMatch = true;

          items.find((item) => {
            if (rootItem instanceof RecursiveSyntax) {
              if (
                rootItem.breakRecursion.isValid(tokens[currentIndex + index])
              ) {
                return true;
              }
            }

            if (item instanceof EmptySyntax) {
              shouldRun = true;
              noMatch = true;

              return true;
            }

            if (item instanceof RequiredSyntax) {
              throw new Error(
                `Invalid syntax close to ${tokens
                  .slice(currentIndex, currentIndex + 5)
                  .join(' ')}`
              );
            }

            const options = this.isValidOperation({
              currentIndex: currentIndex + index,
              tokens,
              tokenValue,
              level,
              item,
              parent: root || null,
              variableScopes,
            });

            if (options.isValid) {
              if (item instanceof TokenName) {
                fieldValues[item.name] = tokenValue;
              }
              if (item instanceof Syntax) {
                if (item.connectedFields) {
                  fieldValues = {
                    ...fieldValues,
                    ...options.fieldValues,
                  };
                }
              }

              if (options.node) {
                addNode(options.node);
              }
              currentIndex += options.movedIndex;
              movement += options.movedIndex + 1;

              if (!(rootItem instanceof RecursiveSyntax)) {
                return true;
              } else {
                currentIndex += 1;
                noMatch = false;
                return true;
              }
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
      return {
        root,
        movement,
        fieldValues,
      };
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
    parent,
    variableScopes,
  }: {
    item: Union;
    tokens: string[];
    tokenValue: string;
    currentIndex: number;
    level: number;
    parent: Node | null;
    variableScopes: Record<string, string[]>;
  }):
    | {
        isValid: boolean;
        movedIndex: number;
        node: Node;
        fieldValues: Record<string, string>;
      }
    | {
        isValid: false;
      } {
    if (item instanceof Token) {
      const isKeyword = item instanceof Keyword;
      const isNotSameTokenValue = isKeyword && !item.isValid(tokenValue);
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
          fieldValues: {},
        };
      }
    } else if (item instanceof Syntax) {
      const results = item.matches({
        tokens,
        currentIndex,
        level: level + 1,
        parent,
        variableScopes,
      });
      if (!results) {
        return {
          isValid: false,
        };
      } else {
        const [node, movement, fieldValues] = results;
        return {
          isValid: true,
          movedIndex: movement - 1,
          node,
          fieldValues,
        };
      }
    } else {
      throw new Error('Not implemented');
    }
  }
}
