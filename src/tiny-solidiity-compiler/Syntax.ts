import { makeArray } from '../network/utils/makeArray';
import { FieldNode } from './ast/FieldNode';
import { KeywordNode } from './ast/KeywordNode';
import { Node } from './ast/Node';
import { OptionalSyntax } from './OptionalSyntax';
import { RecursiveSyntax } from './RecursiveSyntax';
import { Keyword } from './tokens/Keyword';
import { Token } from './tokens/Token';
import { TokenName } from './tokens/TokenName';

export class Syntax {
  private tokenOrder: Array<SyntaxInput | RecursiveSyntax> = [];

  private connectedFields = false;

  private nodeConstruction:
    | undefined
    | (new (values: Record<string, string>) => FieldNode) = undefined;

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

  public thenOptional(
    optionalSyntax: Syntax | Syntax[],
    thenSyntax: Syntax | OptionalSyntax
  ) {
    // TODO: clean this up
    const optionalSyntaxArray = makeArray(optionalSyntax);
    const convertedThenSyntax =
      thenSyntax instanceof OptionalSyntax
        ? thenSyntax.optionality()
        : thenSyntax;

    optionalSyntaxArray.forEach((item) => {
      item.then(convertedThenSyntax);
    });

    const thenActualSyntax = Array.isArray(convertedThenSyntax)
      ? undefined
      : convertedThenSyntax;

    const paths = [...optionalSyntaxArray];
    if (thenActualSyntax) {
      paths.push(thenActualSyntax);
    }

    this.tokenOrder.push(paths);
    return this;
  }

  public matches({
    tokens,
    currentIndex,
    level,
    parent,
  }: {
    currentIndex: number;
    level: number;
    tokens: string[];
    parent: null | Node;
  }): null | [Node, number, Record<string, string>] {
    let root: Node | undefined;
    let fieldValues: Record<string, string> = {};

    let movement = 0;
    const hasValidSyntax = this.tokenOrder.every((inputItem, index) => {
      const addNode = (node: Node) => {
        if (!root) {
          root = node;
        } else {
          root.add(node);
        }
      };

      const rootItems = makeArray(inputItem);

      const rootCopy: Node = Object.assign({}, root);
      return rootItems.find((rootItem) => {
        let shouldRun = true;
        const copiedCurrentIndex = currentIndex;
        while (shouldRun) {
          let convertedItem;
          const tokenValue = tokens[currentIndex + index];

          if (rootItem instanceof RecursiveSyntax) {
            convertedItem = rootItem.recursiveToken;
            if (rootItem.breakRecursion.isValid(tokenValue)) {
              if (!parent) {
                throw new Error('should this happen ? ');
              }
              root?.add(new KeywordNode(tokenValue));
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

          //   console.log([tokenValue, rootItem, currentIndex + index, level]);
          let noMatch = true;
          items.find((item) => {
            const options = this.isValidOperation({
              currentIndex: currentIndex + index,
              tokens,
              tokenValue,
              level,
              item,
              parent: root || null,
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

              addNode(options.node);
              currentIndex += options.movedIndex;
              movement += options.movedIndex + 1;

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
      if (this.nodeConstruction) {
        // TODO: This should be done automatically on construction
        if (root instanceof FieldNode) {
          return [root, movement, fieldValues];
        }
        const fieldNode = new this.nodeConstruction(fieldValues);
        const recursiveAddFieldNodes = (currentNode: Node) => {
          currentNode?.nodes.forEach((item) => {
            if (item instanceof FieldNode) {
              // TODO, this should only transfer field nodes.
              fieldNode.add(item);
            } else {
              recursiveAddFieldNodes(item);
            }
          });
        };
        if (root) {
          recursiveAddFieldNodes(root);
        }

        return [fieldNode, movement, fieldValues];
      }
      if (root) {
        return [root, movement, fieldValues]; // this.tokenOrder.length];
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
    parent,
  }: {
    item: Union;
    tokens: string[];
    tokenValue: string;
    currentIndex: number;
    level: number;
    parent: Node | null;
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

  public get root(): Token {
    const value = this.tokenOrder[0];
    if (!(value instanceof Token)) {
      throw new Error('First token should always be a identifier');
    }
    return value;
  }

  public construct(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    returnNode: new (values: Record<string, string>) => FieldNode<any>
  ): Syntax {
    this.nodeConstruction = returnNode;
    return this;
  }

  public get node() {
    return this.nodeConstruction;
  }

  public isConnectedFields(): Syntax {
    this.connectedFields = true;
    return this;
  }
}

type Union = Token | Syntax;
type SyntaxInput = Array<Union> | Union;
