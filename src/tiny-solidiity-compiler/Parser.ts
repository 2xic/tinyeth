import { injectable } from 'inversify';
import { Node } from './ast/Node';
import { Lexer } from './Lexer';
import { Syntax } from './Syntax';
import { Keyword } from './tokens/Keyword';
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

    const variablesAssignment = this.addSyntax({
      syntax: new Syntax(new Keyword('uint8'))
        .then(new Keyword('public'))
        .then(new StringToken())
        .then(new Keyword(';')),
      syntaxStorage,
    });

    const codeSection = this.addSyntax({
      syntax: new Syntax(new Keyword('{'))
        .then(variablesAssignment)
        .then(new Keyword('}')),
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
