import { Node, NodeType } from './Node';

export class EmptyNode extends Node {
  constructor() {
    super({
      key: Buffer.from('deadbeef'),
      value: Buffer.from('deadbeef'),
    });
  }

  public get type(): NodeType {
    return NodeType.EMPTY_NODE;
  }

  public get rawValues(): Buffer[] {
    throw new Error('No values are on a empty node');
  }
}
