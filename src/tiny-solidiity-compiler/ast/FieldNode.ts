import { Node } from './Node';

export class FieldNode<T = Record<string, string>> extends Node {
  constructor(protected fieldValues: Record<string, string>) {
    super('');
  }

  public get fields(): T {
    return this.fieldValues as unknown as T;
  }
}
