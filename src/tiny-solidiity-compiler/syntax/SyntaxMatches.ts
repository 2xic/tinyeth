import { makeArray } from '../../network/utils/makeArray';
import { KeywordNode } from '.././ast/KeywordNode';
import { Node } from '.././ast/Node';
import { RecursiveSyntax } from './RecursiveSyntax';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from '.././tokens/Token';
import { EmptySyntax } from '.././EmptySyntax';
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
    movement: number;
    fieldValues: Record<string, string>;
  } {
    let root: Node | undefined;

    let movement = 0;

    const hasValidSyntax = syntax.tokenOrder.every((inputItem, index) => {
      const rootCopy: Node = Object.assign({}, root);

      return makeArray(inputItem).find((rootItem) => {
        let shouldRun = true;
        const copiedCurrentIndex = syntaxContext.context.currentIndex;
        while (shouldRun) {
          let convertedItem: Syntax | EmptySyntax;
          const tokenValue =
            syntaxContext.context.tokens[
              syntaxContext.context.currentIndex + index
            ];

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

          syntaxContext.context.movedIndex = index;

          const {
            noMatch,
            reset,
            shouldRun: newShouldRun,
            movement: newMovement,
            root: newRoot,
          } = new SyntaxValidator().isValidItemSyntax({
            items,
            root,
            rootItem,
            level,
            syntaxContext,
          });
          if (reset) {
            if (root) {
              Object.assign(root, rootCopy);
              syntaxContext.context.currentIndex = copiedCurrentIndex;
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
        fieldValues: syntaxContext.context.fieldValues,
      };
    } else {
      return null;
    }
  }
}
