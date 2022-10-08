import { Node, NodeType } from './Node';

export class BranchNode extends Node {
  private children: Array<Buffer | number> = [...new Array(17)];

  constructor(
    protected options: {
      key: Buffer;
      value: Buffer;
    }
  ) {
    super(options);

    this.children = this.children.map(() => 0);
    this.children[this.children.length - 1] = options.value;
  }

  public insert(index: number, node: Buffer, overwrite = false) {
    if (this.children[index] && !overwrite) {
      throw new Error(`you overwrite a key at index ${index}, are you sure ?`);
    }
    this.children[index] = node;
    return this;
  }

  public get(index: number): Buffer | null {
    if (index < 0 || index > 15) {
      throw new Error('out of range');
    }
    const value = this.children[index];
    if (!value || typeof value == 'number') {
      return null;
    }
    return value;
  }

  public get type(): NodeType {
    return NodeType.BRANCH_NODE;
  }

  public get rawValues(): Buffer[] {
    return this.children.map((item) => {
      if (typeof item === 'number') {
        return Buffer.alloc(0);
      } else {
        return item;
      }
    });
  }
}
