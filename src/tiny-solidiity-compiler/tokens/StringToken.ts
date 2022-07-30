import { StringNode } from '../ast/StringNode';
import { Token } from './Token';

export class StringToken extends Token {
  constructor() {
    super();
  }

  public isValid(input: string): boolean {
    return !!input.match(/^[0-9a-zA-Z]+$/);
  }

  public node(): new (value: string) => StringNode {
    return StringNode;
  }
}
