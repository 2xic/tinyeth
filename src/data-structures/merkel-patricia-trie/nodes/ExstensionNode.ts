import { Node, NodeType } from './Node';

export class ExtensionNode extends Node {
  constructor(protected options: { key: Buffer; value: Buffer }) {
    super(options);
  }

  public get type(): NodeType {
    return NodeType.EXTENSION_NODE;
  }

  public get rawValues(): Buffer[] {
    return [this.key, this.options.value];
  }
}
