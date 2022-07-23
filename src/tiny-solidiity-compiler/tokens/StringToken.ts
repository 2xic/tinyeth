import { Node } from '../ast/Node';
import { VariableNode } from '../ast/VariableNode';
import { Token } from './Token';

export class StringToken extends Token {
  constructor(inputValue: string | null = null) {
    super(inputValue);
  }

  public isValid(input?: string): boolean {
    return !!(input || this.value)?.match(/^[0-9a-zA-Z]+$/);
  }

  public node(): new (value: string) => VariableNode {
    return VariableNode;
  }
}
