import { injectable } from 'inversify';
import { Scanner } from './Scanner';
import { AnyToken } from './tokens/AnyToken';
import { Token } from './tokens/Token';

@injectable()
export class Lexer {
  public getTokens({ input }: { input: string }): string[] {
    const scanner = new Scanner(input);
    const tokens: string[] = [];

    while (!scanner.isDone) {
      const token = scanner.getNextToken();
      if (token.length) {
        tokens.push(token);
      }
    }

    return tokens;
  }
}

type TokenTypes = Token;
