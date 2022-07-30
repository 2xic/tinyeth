import { injectable } from 'inversify';
import { ContractNode } from './ast/ContractNode';
import { FunctionNode } from './ast/FunctionNode';
import { Node } from './ast/Node';
import { ReturnNode } from './ast/ReturnNode';
import { VariableNode } from './ast/VariableNode';
import { Lexer } from './Lexer';
import { Syntax } from './Syntax';
import { AccessModifiers } from './tokens/AccessModifiers';
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

    const functionArguments = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('(')).then(
        new SpecificKeyword(')')
      ),
      syntaxStorage,
    });

    const unnamedArguments = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('(')).thenRecursive(
        new Syntax(new Types()),
        new StopToken(')')
      ),
      syntaxStorage,
    });

    const variablesDeceleration = this.addSyntax({
      syntax: new Syntax(new TokenName(new Types(), 'type'))
        .then(new TokenName(new AccessModifiers(), 'access'))
        .then(new TokenName(new StringToken(), 'name'))
        .then(new SpecificKeyword(';'))
        .construct(VariableNode),
      syntaxStorage,
    });

    const localVariableAssignment = this.addSyntax({
      syntax: new Syntax(new TokenName(new Types(), 'type'))
        .then(new TokenName(new StringToken(), 'name'))
        .then(new SpecificKeyword('='))
        .then(new TokenName(new StringToken(), 'value'))
        .then(new SpecificKeyword(';'))
        .construct(VariableNode),
      syntaxStorage,
    });

    const returnStatement = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('return'))
        .then(new TokenName(new StringToken(), 'value'))
        //.then(new StringToken())
        .then(new SpecificKeyword(';'))
        .construct(ReturnNode),
      syntaxStorage,
    });

    const functionSection = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('function'))
        .then(new TokenName(new StringToken(), 'name'))
        .then(functionArguments)
        .then(new AccessModifiers())
        .then(new SpecificKeyword('pure'))
        .then(new SpecificKeyword('returns'))
        .then(unnamedArguments)
        .then(
          // TODO: separate this into local and global code section
          new Syntax(new SpecificKeyword('{')).thenRecursive(
            [localVariableAssignment, returnStatement],
            // TODO: Is this a good abstraction ?
            // stop token and start token for recursion?
            new StopToken('}')
          )
        )
        .construct(FunctionNode),
      syntaxStorage,
    });

    const codeSection = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('{')).thenRecursive(
        [variablesDeceleration, functionSection],
        // TODO: Is this a good abstraction ?
        // stop token and start token for recursion?
        new StopToken('}')
      ),
      syntaxStorage,
    });
    const emptyCodeSection = this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('{')).then(
        new SpecificKeyword('}')
      ),
      syntaxStorage,
    });

    this.addSyntax({
      syntax: new Syntax(new SpecificKeyword('contract'))
        .then(new TokenName(new StringToken(), 'name'))
        .then([codeSection, emptyCodeSection])
        .construct(ContractNode),
      syntaxStorage,
    });

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
