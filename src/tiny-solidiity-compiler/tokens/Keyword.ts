import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Token } from './Token';

export class Keyword extends Token {
  constructor(private tokenName: string) {
    super();
  }

  public get value(): string {
    return this.tokenName;
  }

  public isValid(input: string): boolean {
    // TODO: Instead of storing all keywords here, I think it's easier to create
    //      subtypes for each keyword. I.e all variables type should be it's own subtype.
    //      I think this also makes validation cleaner.
    const keywords = ['contract'];

    return keywords.includes(input);
  }

  public node(): new (value: string) => Node {
    return KeywordNode;
  }
}
