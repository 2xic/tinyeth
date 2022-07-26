import { injectable } from 'inversify';
import { Node } from './ast/Node';
import { Lexer } from './Lexer';
import { Syntax } from './Syntax';
import { AccessModifiers } from './tokens/AccessModifiers';
import { Keyword } from './tokens/Keyword';
import { StopToken } from './tokens/StopToken';
import { StringToken } from './tokens/StringToken';

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
      syntax: new Syntax(new Keyword('(')).then(new Keyword(')')),
      syntaxStorage,
    });

    const unnamedArguments = this.addSyntax({
      syntax: new Syntax(new Keyword('(')).thenRecursive(
        new Syntax(new Keyword('uint8')),
        new StopToken(')')
      ),
      syntaxStorage,
    });

    const variablesAssignment = this.addSyntax({
      syntax: new Syntax(new Keyword('uint8'))
        .then(new AccessModifiers())
        .then(new StringToken())
        .then(new Keyword(';')),
      syntaxStorage,
    });

    const returnStatement = this.addSyntax({
      syntax: new Syntax(new Keyword('return'))
        .then(new StringToken())
        .then(new Keyword(';')),
      syntaxStorage,
    });

    const functionSection = this.addSyntax({
      syntax: new Syntax(new Keyword('function'))
        .then(new StringToken())
        .then(functionArguments)
        .then(new AccessModifiers())
        .then(new Keyword('pure'))
        .then(new Keyword('returns'))
        .then(unnamedArguments)
        .then(
          // TODO: seperate this into local and global code section
          new Syntax(new Keyword('{')).thenRecursive(
            [variablesAssignment, returnStatement],
            // TODO: Is this a good abstraction ?
            // stop token and start token for recursion?
            new StopToken('}')
          )
        ),
      syntaxStorage,
    });

    const codeSection = this.addSyntax({
      syntax: new Syntax(new Keyword('{')).thenRecursive(
        [variablesAssignment, functionSection],
        // TODO: Is this a good abstraction ?
        // stop token and start token for recursion?
        new StopToken('}')
      ),
      syntaxStorage,
    });
    const emptyCodeSection = this.addSyntax({
      syntax: new Syntax(new Keyword('{')).then(new Keyword('}')),
      syntaxStorage,
    });

    this.addSyntax({
      syntax: new Syntax(new Keyword('contract'))
        .then(new StringToken())
        .then([codeSection, emptyCodeSection]),
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
    const syntaxRoot = syntax.root;
    if (!(syntaxRoot instanceof Keyword)) {
      throw new Error('First token in a syntax must be a keyword');
    }
    const rootToken = syntaxRoot.value;
    if (!rootToken) {
      throw new Error('expected root token');
    }
    if (!syntaxStorage[rootToken]) {
      syntaxStorage[rootToken] = [];
    }
    syntaxStorage[rootToken].push(syntax);

    return syntax;
  }
}
