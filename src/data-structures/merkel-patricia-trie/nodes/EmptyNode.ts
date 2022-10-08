import { Node, NodeType } from './Node';

export class EmptyNode implements Node {
  public get type(): NodeType {
    return NodeType.EMPTY_NODE;
  }

  public get value(): string {
    return '';
  }

  public get rawValues(): Buffer[] {
    throw new Error('No values are on a empty node');
  }
}
