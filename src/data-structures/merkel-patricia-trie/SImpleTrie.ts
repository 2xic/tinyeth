import { allocUnsafe } from 'bun';
import { Extension, OutliningSpanKind } from 'typescript';
import { Parser } from '../../tiny-solidiity-compiler';
import { InMemoryDatabase } from '../utils/InMemoryDatabase';
import { BranchNode } from './nodes/BranchNode';
import { ExtensionNode } from './nodes/ExstensionNode';
import { LeafNode } from './nodes/LeafNode';
import { Node, NodeType } from './nodes/Node';

/*
  Job of the class is just to maintain the root, and deal with the replacement of nodes.
*/
export class SimpleTrie {
  constructor(private root: Node) {
    this.currentRoot = this.root;
  }

  private currentRoot: Node;

  public traverse({
    key: inputKey,
    callback,
  }: {
    key: Buffer;
    callback: (options: { key: Buffer; node: Node }) => {
      node: Node;
      consumedKeyLength: number;
    };
  }) {
    this.currentRoot = this.recursiveTravel({
      currentKey: inputKey,
      callback,
      currentNode: this.root,
    });
  }

  private recursiveTravel({
    currentNode,
    currentKey,
    callback,
  }: {
    currentNode: Node;
    currentKey: Buffer;
    callback: (options: { key: Buffer; node: Node }) => {
      node: Node;
      consumedKeyLength: number;
    };
  }): Node {
    if (currentKey.length === 0) {
      return currentNode;
    }

    const results = callback({
      key: currentKey,
      node: currentNode,
    });

    if ('node' in results) {
      const newNode = this.recursiveTravel({
        currentKey: currentKey.slice(results.consumedKeyLength),
        currentNode: results.node,
        callback,
      });

      return this.mergeChanges({
        child: newNode,
        parent: currentNode,
      });
    } else {
      throw new Error('Unknown state');
    }
  }

  private mergeChanges({ parent, child }: { parent: Node; child: Node }): Node {
    if (parent.type === NodeType.EMPTY_NODE) {
      return child;
    } else if (
      parent.type == NodeType.LEAF_NODE &&
      child.type === NodeType.EXTENSION_NODE
    ) {
      return child;
    } else if (
      parent.type === NodeType.EXTENSION_NODE &&
      child.type === NodeType.EXTENSION_NODE
    ) {
      return child;
    } else if (
      parent.type === NodeType.EXTENSION_NODE &&
      child.type === NodeType.BRANCH_NODE
    ) {
      const newExtensionNode = new ExtensionNode({
        key: (parent as ExtensionNode).key,
        value: (child as BranchNode).nodeKey,
      });

      return newExtensionNode;
    } else if (
      parent.type === NodeType.BRANCH_NODE &&
      child.type === NodeType.BRANCH_NODE
    ) {
      return child;
    }

    throw new Error(`${parent.type} -> ${child.type}`);
  }

  public get newRoot() {
    return this.currentRoot;
  }
}
