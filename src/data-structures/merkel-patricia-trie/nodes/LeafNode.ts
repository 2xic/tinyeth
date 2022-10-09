import { Node, NodeType } from './Node';

export class LeafNode extends Node {
  constructor(protected options: { key: Buffer; value: Buffer }) {
    super(options);
  }

  public get type(): NodeType {
    return NodeType.LEAF_NODE;
  }

  public get rawValues(): Buffer[] {
    return [this.key, this.value];
  }
}
