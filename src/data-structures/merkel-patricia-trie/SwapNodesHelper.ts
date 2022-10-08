import { InMemoryDatabase } from '../utils/InMemoryDatabase';
import { BranchNode } from './nodes/BranchNode';
import { ExtensionNode } from './nodes/ExstensionNode';
import { LeafNode } from './nodes/LeafNode';
import { Node } from './nodes/Node';

export class SwapNodeHelper {
  constructor(private database: InMemoryDatabase) {}

  public swapLeafWithExtension({
    key,
    value,
    node,
    prefix,
  }: {
    key: Buffer;
    value: Buffer;
    node: Node;
    prefix: Buffer;
  }) {
    const branchNode = new BranchNode({
      key: node.key,
      value: node.value,
    });

    const keyValue = key[prefix.length];
    const leafNode = new LeafNode({
      key: key.slice(prefix.length),
      value,
    }).store(this.database);

    branchNode.insert(keyValue, leafNode.nodeKey).store(this.database);

    const newNode: ExtensionNode = new ExtensionNode({
      key: prefix,
      value: branchNode.nodeKey,
    });

    return newNode;
  }

  public swapExtensionNOdeWithBranchNode({
    key,
    value,
    node,
    prefix,
  }: {
    key: Buffer;
    value: Buffer;
    node: Node;
    prefix: Buffer;
  }) {
    const branchNode = new BranchNode({
      key: Buffer.alloc(0),
      value: Buffer.alloc(0),
    });

    const oldExtensionNodeKey = node.key.slice(prefix.length);
    const oldExtensionNode = new ExtensionNode({
      key: oldExtensionNodeKey.slice(1),
      value: node.value,
    }).store(this.database);

    const leafNodeKeyValue = key.slice(prefix.length)[0];

    const newLeafNode = new LeafNode({
      key: Buffer.alloc(0),
      value: value,
    }).store(this.database);

    const oldExtensionNodeKeyValue = oldExtensionNodeKey[0];
    branchNode.insert(oldExtensionNodeKeyValue, oldExtensionNode.nodeKey);
    branchNode
      .insert(leafNodeKeyValue, newLeafNode.nodeKey)
      .store(this.database);

    const newExtensionNode = new ExtensionNode({
      key: prefix,
      value: branchNode.nodeKey,
    });

    return newExtensionNode;
  }

  public swapLeafNodeOnBranch({
    key,
    value,
    node,
    prefix,
    leafNode,
    branchKeyIndex,
  }: {
    key: Buffer;
    value: Buffer;
    node: BranchNode;
    prefix: Buffer;
    branchKeyIndex: number;
    leafNode: Node;
  }) {
    const newLeafKey = leafNode.key.slice(1 + prefix.length);
    const newBranchNode = new BranchNode({
      key: Buffer.alloc(0),
      value: newLeafKey.length ? Buffer.alloc(0) : leafNode.value,
    });

    if (newLeafKey.length) {
      throw new Error('Has to insert the leaf key node into a new branch');
    }

    const keyIndex = key.slice(prefix.length);
    const newLeafNode = new LeafNode({
      key,
      value,
    }).store(this.database);

    newBranchNode.insert(keyIndex[0], newLeafNode.nodeKey).store(this.database);

    const extensionNode = new ExtensionNode({
      key: prefix,
      value: newBranchNode.nodeKey,
    }).store(this.database);

    node
      .insert(branchKeyIndex, extensionNode.nodeKey, true)
      .store(this.database);

    return node;
  }
}
