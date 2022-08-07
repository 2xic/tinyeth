import { makeArray } from '../../network/utils/makeArray';
import { KeywordNode } from '.././ast/KeywordNode';
import { Node } from '.././ast/Node';
import { RecursiveSyntax } from './RecursiveSyntax';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from '.././tokens/Token';
import { EmptySyntax } from './EmptySyntax';
import { Syntax } from './Syntax';
import { SyntaxContext } from './SyntaxContext';
import { SyntaxValidator } from './SyntaxValidator';

export class SyntaxMatch {
  public matches({
    syntax,
    level,
    parent,
    syntaxContext,
  }: {
    syntax: Syntax;
    level: number;
    parent: null | Node;
    syntaxContext: SyntaxContext;
  }): null | {
    root?: Node;
    indexMovement: number;
    fieldValues: Record<string, string>;
  } {
    const context: Context = {
      root: undefined,
      indexMovement: 0,
      shouldContinueToParseSyntax: true,
    };

    const hasValidSyntax = syntax.tokenOrder.every((inputItem, index) => {
      const rootCopy: Node = Object.assign({}, context.root);

      return makeArray(inputItem).find((rootItem) => {
        context.shouldContinueToParseSyntax = true;

        const copiedCurrentIndex = syntaxContext.context.currentIndex;
        while (context.shouldContinueToParseSyntax) {
          let convertedItem: Syntax | EmptySyntax;
          const tokenValue = syntaxContext.tokenValue;

          if (rootItem instanceof RecursiveSyntax) {
            convertedItem = rootItem.recursivePaths;
            if (rootItem.breakRecursion.isValid(tokenValue)) {
              if (!parent) {
                throw new Error(
                  'should not be able to break out of recursion without a parent item.'
                );
              }

              context.root?.add(new KeywordNode(tokenValue));
              context.indexMovement++;

              break;
            }
          } else {
            convertedItem = rootItem;
          }

          // TODO: this should probably not be recursive at this level.
          const items = makeArray<RequiredSyntax | Syntax | Token>(
            convertedItem
          );

          syntaxContext.context.movedIndex = index;

          const {
            noMatch,
            reset,
            shouldContinueToParseSyntax,
            root,
            indexMovement,
          } = new SyntaxValidator().isValidItemSyntax({
            items,
            root: context.root,
            rootItem,
            level,
            syntaxContext,
          });

          if (reset) {
            if (context.root) {
              Object.assign(context.root, rootCopy);
              syntaxContext.context.currentIndex = copiedCurrentIndex;
              context.shouldContinueToParseSyntax = false;
            } else {
              context.shouldContinueToParseSyntax = false;
            }
          } else {
            context.shouldContinueToParseSyntax = shouldContinueToParseSyntax;
          }

          context.indexMovement += indexMovement;
          context.root = root;

          if (noMatch) {
            break;
          }
        }
        return context.shouldContinueToParseSyntax;
      });
    });

    if (hasValidSyntax) {
      return {
        root: context.root,
        indexMovement: context.indexMovement,
        fieldValues: syntaxContext.context.fieldValues,
      };
    } else {
      return null;
    }
  }
}

interface Context {
  shouldContinueToParseSyntax: boolean;
  root?: Node;
  indexMovement: number;
}
