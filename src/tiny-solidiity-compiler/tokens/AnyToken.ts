import { Node } from '../ast/Node';
import { Token } from './Token';

// Note : this is just a token used while developing
export class AnyToken extends Token {
  constructor(inputValue: string | null = null) {
    super(inputValue);
  }

  public isValid(): boolean {
    return true;
  }

  public node(): new (value: string) => Node {
    return Node;
  }
}
