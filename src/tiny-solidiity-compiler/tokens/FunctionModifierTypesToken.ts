import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Keyword } from './Keyword';

export class FunctionModifierTypesToken extends Keyword {
  private keywords = ['payable', 'pure', 'view'];

  constructor() {
    super();
  }

  public isValid(input: string): boolean {
    return this.keywords.includes(input);
  }

  public value() {
    return this.keywords;
  }

  public node(): new (value: string) => Node {
    return KeywordNode;
  }
}
