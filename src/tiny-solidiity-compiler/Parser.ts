import { injectable } from 'inversify';
import { ConditionalNode } from './ast/ConditionalNode';
import { ContractNode } from './ast/ContractNode';
import { FunctionNode } from './ast/FunctionNode';
import { Node } from './ast/Node';
import { ReturnNode } from './ast/ReturnNode';
import { VariableNode } from './ast/VariableNode';
import { Lexer } from './Lexer';
import { OptionalSyntax } from './OptionalSyntax';
import { Syntax } from './Syntax';
import { AccessModifiers } from './tokens/AccessModifiers';
import { FunctionModifierTypesToken } from './tokens/FunctionModifierTypesToken';
import { Keyword } from './tokens/Keyword';
import { SpecificKeyword } from './tokens/SpesificKeyword';
import { StopToken } from './tokens/StopToken';
import { StringToken } from './tokens/StringToken';
import { TokenName } from './tokens/TokenName';
import { Types } from './tokens/Types';

@injectable()
export class Parser {
  private syntaxReferences: Record<string, Syntax[]>;

  constructor(private lexer: Lexer) {
    this.syntaxReferences = this.constructSyntax();
  }

  public parse({ input }: { input: string }) {
    const tokens = this.lexer.getTokens({ input });

    return this.recursiveConstruction({
      tokens,
    });
  }

  private recursiveConstruction({
    tokens,
    currentIndex = 0,
    level = 0,
  }: {
    tokens: string[];
    currentIndex?: number;
    level?: number;
  }): Node | null {
    const token = tokens[currentIndex];

    const syntaxRoutes = this.syntaxReferences[token];
    if (syntaxRoutes) {
      for (const syntax of syntaxRoutes) {
        const currentTokens = [...tokens];
        const value = syntax.matches({
          tokens: currentTokens,
          currentIndex,
          level,
          parent: null,
        });

        if (value) {
          return value[0];
        }
      }
      throw new Error(
        `Unknown syntax ${currentIndex} ${tokens.slice(currentIndex)}`
      );
    } else if (level == 0) {
      throw new Error(
        `Unknown syntax for token at  ${currentIndex}  ${token.slice(
          currentIndex
        )}`
      );
    }

    return null;
  }

  private constructSyntax(): Record<string, Syntax[]> {
    const syntaxStorage: Record<string, Syntax[]> = {};

    const functionArguments = new Syntax(new SpecificKeyword('(')).then(
      new SpecificKeyword(')')
    );

    const unnamedArguments = new Syntax(new SpecificKeyword('(')).thenRecursive(
      new Syntax(new Types()),
      new StopToken(')')
    );

    const conditionalArguments = new Syntax(
      new SpecificKeyword('(')
    ).thenRecursive(
      // TODO: Should be || and && then token recursive.
      new Syntax(new SpecificKeyword('true')),
      new StopToken(')')
    );

    const variablesDeceleration = new Syntax(new TokenName(new Types(), 'type'))
      .then(new TokenName(new AccessModifiers(), 'access'))
      .then(new TokenName(new StringToken(), 'name'))
      .then(new SpecificKeyword(';'))
      .construct(VariableNode);

    const localVariableAssignment = new Syntax(
      new TokenName(new Types(), 'type')
    )
      .then(new TokenName(new StringToken(), 'name'))
      .then(new SpecificKeyword('='))
      .then(new TokenName(new StringToken(), 'value'))
      .then(new SpecificKeyword(';'))
      .construct(VariableNode);

    const returnStatement = new Syntax(new SpecificKeyword('return'))
      .then(new TokenName(new StringToken(), 'value'))
      //.then(new StringToken())
      .then(new SpecificKeyword(';'))
      .construct(ReturnNode);
    const elseStatement = new Syntax(new SpecificKeyword('else'))
      .then(new SpecificKeyword('{'))
      .thenRecursive(
        [variablesDeceleration, returnStatement],
        // TODO: Is this a good abstraction ?
        // stop token and start token for recursion?
        new StopToken('}')
      )
      .construct(ConditionalNode);

    const ifStatement = new Syntax(new SpecificKeyword('if'))
      .then(conditionalArguments)
      .then(new SpecificKeyword('{'))
      .thenRecursive(
        [variablesDeceleration, returnStatement],
        // TODO: Is this a good abstraction ?
        // stop token and start token for recursion?
        new StopToken('}')
      )
      .thenOptional(elseStatement)
      .construct(ConditionalNode);

    const functionSection = new Syntax(new SpecificKeyword('function'))
      .then(new TokenName(new StringToken(), 'name'))
      .then(functionArguments)
      // TODO: Is this a good abstraction ?
      //      It does look a bit messy.
      //    ALSO! It does not currently propagate fields upwards.
      //    This results in us currently not being able to know the modifier
      //    because it's an optional syntax.
      /*
          Thinking about this a bit more, what is the best way to solve for this ?
          ->  We can just tell the syntax to use the fields at a higher level ?
          ->  We need a way to separate levels.
          ->  Then optional fields with parent fields.
            -> This makes it easy to separate.
            -> Then optional always carriers fields of child nodes ?
        */
      .thenOptional(
        [
          new Syntax(new AccessModifiers())
            .then(new TokenName(new FunctionModifierTypesToken(), 'modifier'))
            .isConnectedFields(),
          new Syntax(new AccessModifiers()),
        ],
        new OptionalSyntax().paths(
          new Syntax(new SpecificKeyword('returns')).then(unnamedArguments),
          // Shared
          new Syntax(new SpecificKeyword('{')).thenRecursive(
            [localVariableAssignment, ifStatement, returnStatement],
            // TODO: Is this a good abstraction ?
            // stop token and start token for recursion?
            new StopToken('}')
          )
        )
      )
      .construct(FunctionNode);

    const codeSection = new Syntax(new SpecificKeyword('{')).thenRecursive(
      [variablesDeceleration, functionSection],
      // TODO: Is this a good abstraction ?
      // stop token and start token for recursion?
      new StopToken('}')
    );
    const emptyCodeSection = new Syntax(new SpecificKeyword('{')).then(
      new SpecificKeyword('}')
    );

    this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('contract'))
        .then(new TokenName(new StringToken(), 'name'))
        .then([codeSection, emptyCodeSection])
        .construct(ContractNode),
      syntaxStorage,
    });
    /**
     * Syntax missing
     *  library definitions
     *  if / else conditions
     *  make function payable
     *  assembly keyword
     * +++ https://docs.soliditylang.org/en/v0.8.15/grammar.html
     *
     */

    return syntaxStorage;
  }

  private addSyntax({
    syntax,
    syntaxStorage,
  }: {
    syntax: Syntax;
    syntaxStorage: Record<string, Syntax[]>;
  }) {
    let syntaxRoot = syntax.root;

    if (syntaxRoot instanceof TokenName) {
      syntaxRoot = syntaxRoot.token;
    }

    if (!(syntaxRoot instanceof Keyword)) {
      throw new Error('First token in a syntax must be a keyword');
    }
    const rootToken = syntaxRoot.value();
    if (!rootToken) {
      throw new Error('expected root token');
    }
    const values = !Array.isArray(rootToken) ? [rootToken] : rootToken;
    values.forEach((rootToken) => {
      if (!syntaxStorage[rootToken]) {
        syntaxStorage[rootToken] = [];
      }
      syntaxStorage[rootToken].push(syntax);
    });

    return syntax;
  }
}
