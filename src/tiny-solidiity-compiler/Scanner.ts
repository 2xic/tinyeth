export class Scanner {
  private index = 0;

  constructor(private input: string) {}

  public getNextToken(): string {
    if (this.isDone) {
      throw new Error('out of range');
    }
    let token = '';
    while (!this.isDone) {
      const char = this.input[this.index++];

      if (this.isWhitespaceSeparatorToken({ char })) {
        if (token.length) {
          break;
        }
      } else if (this.isSpecialCharacters({ char })) {
        if (token.length) {
          this.index--;
          break;
        } else {
          token += char;
          break;
        }
      } else {
        token += char;
      }
    }
    return token;
  }

  private isWhitespaceSeparatorToken({ char }: { char: string }) {
    return ['\n', '\t', ' '].includes(char);
  }

  private isSpecialCharacters({ char }: { char: string }) {
    return ['[', ']', '{', '}', ';'].includes(char);
  }

  public get isDone() {
    return this.input.length <= this.index;
  }
}
