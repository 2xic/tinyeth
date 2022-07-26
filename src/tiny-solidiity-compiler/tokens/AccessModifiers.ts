import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Token } from './Token';

export class AccessModifiers extends Token {
  constructor() {
    super();
  }

  public isValid(input: string): boolean {
    const keywords = ['public', 'private', 'protected'];

    return keywords.includes(input);
  }

  public node(): new (value: string) => Node {
    return KeywordNode;
  }
}
