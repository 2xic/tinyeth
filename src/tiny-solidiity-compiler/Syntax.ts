import { makeArray } from '../network/utils/makeArray';
import { FieldNode } from './ast/FieldNode';
import { KeywordNode } from './ast/KeywordNode';
import { Node } from './ast/Node';
import { OptionalSyntax } from './OptionalSyntax';
import { RecursiveSyntax } from './RecursiveSyntax';
import { Keyword } from './tokens/Keyword';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from './tokens/Token';
import { TokenName } from './tokens/TokenName';
import { VariableNode } from './ast/VariableNode';
import { ConditionalInputVariables } from './ast/ConditionalInputVariables';
import { UndeclaredVariableError } from './errors/UndeclaredVariableError';
import { EmptySyntax } from './EmptySyntax';

export class Syntax {
  private tokenOrder: Array<SyntaxInput | RecursiveSyntax | EmptySyntax> = [];

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

  public thenRecursive(syntax: Syntax | Syntax[], stopToken: Token) {
    this.tokenOrder.push(
      new RecursiveSyntax(
        makeArray<RequiredSyntax | Syntax>(syntax).concat(new RequiredSyntax()),
        stopToken
      )
    );
    return this;
  }

  public thenOptionalPath(
    optionalSyntax: Syntax | Array<Syntax | EmptySyntax>,
    thenSyntax?: Syntax | OptionalSyntax
  ) {
    if (!thenSyntax) {
      this.tokenOrder.push(makeArray(optionalSyntax));
      return this;
    }
    // TODO: clean this up
    const optionalSyntaxArray = makeArray(optionalSyntax);
    const convertedThenSyntax =
      thenSyntax instanceof OptionalSyntax
        ? thenSyntax.optionality()
        : thenSyntax;

    optionalSyntaxArray.forEach((item) => {
      if (!(item instanceof EmptySyntax)) {
        item.then(convertedThenSyntax);
      }
    });
    /*
    const thenActualSyntax = Array.isArray(convertedThenSyntax)
      ? undefined
      : convertedThenSyntax;
    */
    const paths = [...optionalSyntaxArray];
    if (!Array.isArray(convertedThenSyntax)) {
      paths.push(convertedThenSyntax);
    }

    this.tokenOrder.push(paths);
    return this;
  }

  public matches({
    tokens,
    currentIndex,
    level,
    parent,
    variableScopes,
  }: {
    currentIndex: number;
    level: number;
    tokens: string[];
    parent: null | Node;
    variableScopes: Record<string, string[]>;
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
          let convertedItem: Syntax | EmptySyntax;
          const tokenValue = tokens[currentIndex + index];

          if (rootItem instanceof RecursiveSyntax) {
            convertedItem = rootItem.recursivePaths;
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
              return false;
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
          /*
          if (lastItemWasEmpty) {
            throw new Error('hm?');
          }*/

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

        if (fieldNode instanceof VariableNode) {
          if (variableScopes[level]) {
            variableScopes[level].push(fieldNode.fields.name);
          } else {
            variableScopes[level] = [fieldNode.fields.name];
          }
        } else if (fieldNode instanceof ConditionalInputVariables) {
          const variables = fieldNode.variables();
          const isDefined = variables.every((conditionalVariable) => {
            const variablesScope = Object.values(variableScopes).flat();
            return variablesScope.includes(conditionalVariable);
          });

          if (!isDefined) {
            throw new UndeclaredVariableError(`${variables.join(',')}`);
          }
        }

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
        return [root, movement, fieldValues];
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

  public setConnectedFields(): Syntax {
    this.connectedFields = true;
    return this;
  }
}

type Union = Token | Syntax;
type SyntaxInput = Array<Union> | Union;
