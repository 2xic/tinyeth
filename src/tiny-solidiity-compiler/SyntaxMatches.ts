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
  private currentIndex = 0;

  private tokens: string[] = [];

  private variableScopes: Record<string, string[]> = {};

  private fieldValues: Record<string, string> = {};

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
    this.currentIndex = currentIndex;
    this.tokens = tokens;
    this.variableScopes = variableScopes;

    let root: Node | undefined;

    let movement = 0;

    const hasValidSyntax = syntax.tokenOrder.every((inputItem, index) => {
      const rootCopy: Node = Object.assign({}, root);

      return makeArray(inputItem).find((rootItem) => {
        let shouldRun = true;
        const copiedCurrentIndex = this.currentIndex;
        while (shouldRun) {
          let convertedItem: Syntax | EmptySyntax;
          const tokenValue = tokens[this.currentIndex + index];

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

          const {
            noMatch,
            reset,
            shouldRun: newShouldRun,
            movement: newMovement,
            root: newRoot,
          } = this.isValidItemSyntax({
            index,
            items,
            root,
            rootItem,
            level,
          });
          if (reset) {
            if (root) {
              Object.assign(root, rootCopy);
              this.currentIndex = copiedCurrentIndex;
              shouldRun = false;
            } else {
              shouldRun = false;
            }
          }
          movement += newMovement;
          shouldRun = newShouldRun;
          root = newRoot;

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
        fieldValues: this.fieldValues,
      };
    } else {
      return null;
    }
  }

  private isValidItemSyntax({
    items,
    index,
    rootItem,
    level,
    root,
  }: {
    root: Node | undefined;
    level: number;
    index: number;
    items: Array<RequiredSyntax | Syntax | Token>;
    rootItem: Syntax | Token | RecursiveSyntax | EmptySyntax;
  }): {
    root?: Node;
    reset: boolean;
    noMatch: boolean;
    shouldRun: boolean;
    movement: number;
  } {
    const addNode = (node: Node) => {
      if (!root) {
        root = node;
      } else {
        root.add(node);
      }
    };

    const tokenValue = this.tokens[this.currentIndex + index];
    let shouldRun = true;
    let noMatch = true;
    let reset = false;
    let movement = 0;

    items.find((item) => {
      if (rootItem instanceof RecursiveSyntax) {
        if (
          rootItem.breakRecursion.isValid(
            this.tokens[this.currentIndex + index]
          )
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
          `Invalid syntax close to ${this.tokens
            .slice(this.currentIndex, this.currentIndex + 5)
            .join(' ')}`
        );
      }

      const options = this.isValidOperation({
        currentIndex: this.currentIndex + index,
        tokens: this.tokens,
        tokenValue,
        level,
        item,
        parent: root || null,
        variableScopes: this.variableScopes,
      });

      if (options.isValid) {
        if (item instanceof TokenName) {
          this.fieldValues[item.name] = tokenValue;
        }
        if (item instanceof Syntax) {
          if (item.connectedFields) {
            this.fieldValues = {
              ...this.fieldValues,
              ...options.fieldValues,
            };
          }
        }

        if (options.node) {
          addNode(options.node);
        }
        this.currentIndex += options.movedIndex;
        movement += options.movedIndex + 1;

        if (!(rootItem instanceof RecursiveSyntax)) {
          return true;
        } else {
          this.currentIndex += 1;
          noMatch = false;
          return true;
        }
      } else {
        // revert the changes ...
        if (!(rootItem instanceof RecursiveSyntax)) {
          reset = true;
          shouldRun = false;
          return true;
        }
      }
    });

    return {
      noMatch,
      reset,
      shouldRun,
      movement,
      root,
    };
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
