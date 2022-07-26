import { Node } from '../ast/Node';
import { Token } from './Token';

export class StopToken extends Token {
  constructor(private stopValue: string) {
    super();
  }

  public isValid(stopValue: string): boolean {
    return this.stopValue === stopValue;
  }

  public node(): new (value: string) => Node {
    throw new Error('Should not be used');
  }
}
