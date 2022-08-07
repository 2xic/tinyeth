import { Node } from '../ast/Node';
import { RecursiveSyntax } from './RecursiveSyntax';
import { Keyword } from '../tokens/Keyword';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from '../tokens/Token';
import { TokenName } from '../tokens/TokenName';
import { EmptySyntax } from './EmptySyntax';
import { Syntax, Union } from './Syntax';
import { SyntaxContext } from './SyntaxContext';

export class SyntaxValidator {
  public isValidItemSyntax({
    items,
    rootItem,
    level,
    root,
    syntaxContext,
  }: {
    root: Node | undefined;
    level: number;
    items: Array<RequiredSyntax | Syntax | Token>;
    rootItem: Syntax | Token | RecursiveSyntax | EmptySyntax;
    syntaxContext: SyntaxContext;
  }): {
    root?: Node;
    reset: boolean;
    noMatch: boolean;
    shouldContinueToParseSyntax: boolean;
    indexMovement: number;
  } {
    const addNode = (node: Node) => {
      if (!root) {
        root = node;
      } else {
        root.add(node);
      }
    };

    let shouldRun = true;
    let noMatch = true;
    let reset = false;
    let movement = 0;

    items.find((item) => {
      if (rootItem instanceof RecursiveSyntax) {
        if (rootItem.breakRecursion.isValid(syntaxContext.tokenValue)) {
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
          `Invalid syntax close to ${syntaxContext.errorContext}`
        );
      }

      const options = this.isValidOperation({
        syntaxContext,
        parent: root || null,
        level,
        item,
      });

      if (options.isValid) {
        if (item instanceof TokenName) {
          syntaxContext.context.fieldValues[item.name] =
            syntaxContext.tokenValue;
        }
        if (item instanceof Syntax) {
          if (item.connectedFields) {
            syntaxContext.context.fieldValues = {
              ...syntaxContext.context.fieldValues,
              ...options.fieldValues,
            };
          }
        }

        if (options.node) {
          addNode(options.node);
        }

        syntaxContext.context.currentIndex += options.movedIndex;
        movement += options.movedIndex + 1;

        if (!(rootItem instanceof RecursiveSyntax)) {
          return true;
        } else {
          syntaxContext.context.currentIndex += 1;
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
      shouldContinueToParseSyntax: shouldRun,
      indexMovement: movement,
      root,
    };
  }

  private isValidOperation({
    item,
    syntaxContext,
    level,
    parent,
  }: {
    syntaxContext: SyntaxContext;
    item: Union;
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
      const isNotSameTokenValue =
        isKeyword && !item.isValid(syntaxContext.tokenValue);
      const isInvalidToken =
        !isKeyword && !item.isValid(syntaxContext.tokenValue);
      if (isNotSameTokenValue || isInvalidToken) {
        return {
          isValid: false,
        };
      } else {
        const NodeConstructor = item.node();
        const node = new NodeConstructor(syntaxContext.tokenValue);

        return {
          node,
          movedIndex: 0,
          isValid: true,
          fieldValues: {},
        };
      }
    } else if (item instanceof Syntax) {
      const results = item.matches({
        tokens: syntaxContext.context.tokens,
        currentIndex: syntaxContext.sumIndex,
        variableScopes: syntaxContext.context.variableScopes,
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
}
