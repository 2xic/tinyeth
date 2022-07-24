import { Node } from '../ast/Node';

export abstract class Token {
  public abstract isValid(input: string): boolean;

  public abstract node(): new (value: string) => Node;
}
