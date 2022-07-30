import { Node } from '../ast/Node';
import { Token } from './Token';

export class TokenName extends Token {
  constructor(private _token: Token, public name: string) {
    super();
  }

  public isValid(input: string): boolean {
    return this.token.isValid(input);
  }

  public node(): new (value: string) => Node {
    return this.token.node();
  }

  public get token() {
    return this._token;
  }
}
