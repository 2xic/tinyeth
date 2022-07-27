import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Keyword } from './Keyword';

export class SpecificKeyword extends Keyword {
  constructor(private token: string) {
    super();
  }

  public isValid(input: string): boolean {
    return input === this.token;
  }

  public node(): new (value: string) => Node {
    return KeywordNode;
  }

  public value(): string | string[] {
    return this.token;
  }
}
