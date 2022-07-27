import { privateKeyImport } from 'secp256k1';

export class Scanner {
  private index = 0;

  constructor(private input: string) {}

  public getNextToken(): string {
    if (this.isDone) {
      throw new Error('out of range');
    }
    let token = '';
    let isComment: CommentType | null = null;
    while (!this.isDone) {
      const char = this.input[this.index++];

      if (char === '/' && this.peek(0) === '*') {
        isComment = CommentType.MULTI_LINE;
      } else if (
        isComment === CommentType.MULTI_LINE &&
        char === '*' &&
        this.peek(0) === '/'
      ) {
        isComment = null;
        this.index++;
        token = '';
      } else if (char == '/' && this.peek(0) === '/') {
        isComment = CommentType.SINGLE_LINE;
        token = '';
      } else if (char == '\n' && isComment === CommentType.SINGLE_LINE) {
        token = '';
        isComment = null;
      } else if (isComment) {
        token += char;
      } else if (this.isWhitespaceSeparatorToken({ char })) {
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
    return ['[', ']', '{', '}', ';', '(', ')', '/', '*'].includes(char);
  }

  public get isDone() {
    return this.input.length <= this.index;
  }

  private peek(peekLength = 1): string {
    return this.input[this.index + peekLength];
  }
}

enum CommentType {
  MULTI_LINE = 'MULTI_LINE',
  SINGLE_LINE = 'SINGLE_LINE',
}
