import { injectable } from 'inversify';
import { Scanner } from './Scanner';

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
