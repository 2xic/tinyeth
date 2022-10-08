export abstract class Node {
  public abstract get type(): NodeType;

  public abstract get rawValues(): Buffer[];
}

export enum NodeType {
  EMPTY_NODE = 'EMPTY_NODE',
  LEAF_NODE = 'LEAF_NODE',
  BRANCH_NODE = 'BRANCH_NODE',
  EXTENSION_NODE = 'EXTENSION_NODE',
}
