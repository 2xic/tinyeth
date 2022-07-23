import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Token } from './Token';

export class Keyword extends Token {
  constructor(private tokenName: string) {
    super(tokenName);
  }

  public isValid(input?: string): boolean {
    const keywords = ['contract'];

    return keywords.includes(input || this.tokenName);
  }

  public node(): new (value: string) => Node {
    return KeywordNode;
  }
}
