import { Node } from '../ast/Node';

export abstract class Token {
  constructor(private inputValue: string | null) {}

  public get value() {
    return this.inputValue;
  }

  public abstract isValid(input?: string): boolean;

  public abstract node(): new (value: string) => Node;
}
