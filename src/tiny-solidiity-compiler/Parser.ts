import { anything } from 'fast-check';
import { injectable } from 'inversify';
import { Node } from './ast/Node';
import { Lexer } from './Lexer';
import { Syntax } from './Syntax';
import { AnyToken } from './tokens/AnyToken';
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
        // okay, so what do we do if the syntax is recursive ?
        // we can pass a callback.... But then we will never leave here ?

        const value = syntax.matches({
          tokens: currentTokens,
          currentIndex,
          level,
          build: this.recursiveConstruction.bind(this),
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
    const syntaxReferences: Record<string, Syntax[]> = {};

    const addSyntax = (syntax: Syntax, reference?: string) => {
      const rootToken = reference || syntax.root.value;
      if (!rootToken) {
        throw new Error('expected root token');
      }
      if (!syntaxReferences[rootToken]) {
        syntaxReferences[rootToken] = [];
      }
      syntaxReferences[rootToken].push(syntax);

      return syntax;
    };

    const variablesAssignment = addSyntax(
      new Syntax(new Keyword('uint8'))
        .then(new Keyword('public'))
        .then(new StringToken())
        .then(new Keyword(';'))
    );

    const codeSection = addSyntax(
      // TODO: need to make it multi conditional
      new Syntax(new Keyword('{'))
        .then(variablesAssignment)
        .then(new Keyword('}'))
    );
    const emptyCodeSection = addSyntax(
      new Syntax(new Keyword('{')).then(new Keyword('}')),
      '{'
    );

    addSyntax(
      new Syntax(new Keyword('contract'))
        .then(new StringToken())
        .then([codeSection, emptyCodeSection])
    );

    return syntaxReferences;
  }
}
