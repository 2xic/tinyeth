import { makeArray } from '../../network/utils/makeArray';
import { FieldNode } from '.././ast/FieldNode';
import { Node } from '.././ast/Node';
import { OptionalSyntax } from './OptionalSyntax';
import { RecursiveSyntax } from './RecursiveSyntax';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from '.././tokens/Token';
import { VariableNode } from '.././ast/VariableNode';
import { ConditionalInputVariables } from '.././ast/ConditionalInputVariables';
import { UndeclaredVariableError } from '.././errors/UndeclaredVariableError';
import { EmptySyntax } from './EmptySyntax';
import { SyntaxMatch } from './SyntaxMatches';
import { recursiveAddFieldNodes } from './recursiveAddFieldNodes';
import { SyntaxContext } from './SyntaxContext';

export class Syntax {
  public tokenOrder: Array<SyntaxInput | RecursiveSyntax | EmptySyntax> = [];

  public connectedFields = false;

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
    variableScopes,
    level,
    parent,
  }: {
    currentIndex: number;
    level: number;
    tokens: string[];
    parent: null | Node;
    variableScopes: Record<string, string[]>;
  }): null | [Node, number, Record<string, string>] {
    const results = new SyntaxMatch().matches({
      syntaxContext: new SyntaxContext({
        tokens,
        currentIndex,
        variableScopes,
        fieldValues: {},
        movedIndex: 0,
      }),
      level,
      parent,
      syntax: this,
    });

    if (results) {
      const { root, indexMovement: movement, fieldValues } = results;
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

        if (root) {
          recursiveAddFieldNodes({
            currentNode: root,
            fieldNode,
          });
        }

        return [fieldNode, movement, fieldValues];
      }

      if (root) {
        return [root, movement, fieldValues];
      } else {
        throw new Error('This should not happen');
      }
    } else {
      return results;
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

export type Union = Token | Syntax;
type SyntaxInput = Array<Union> | Union;
