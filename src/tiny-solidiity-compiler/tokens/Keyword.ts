import { KeywordNode } from '../ast/KeywordNode';
import { Node } from '../ast/Node';
import { Token } from './Token';

export abstract class Keyword extends Token {
  public abstract isValid(input: string): boolean;

  public abstract value(): string | string[];

  public node(): new (value: string) => Node {
    return KeywordNode;
  }
}
