import { InMemoryDatabase } from '../utils/InMemoryDatabase';
import { BranchNode } from './nodes/BranchNode';
import { EmptyNode } from './nodes/EmptyNode';
import { convertRlpNodeToNode } from './nodes/convertRlpNodeToNode';
import { LeafNode } from './nodes/LeafNode';
import { Node, NodeType } from './nodes/Node';
import { SimpleTrie } from './SImpleTrie';
import { convertBytesToNibbles } from './utils/convertBytesToNibbles';
import {
  CommonPrefixResultType,
  GetCommonPrefixResult,
} from './utils/GetCommonPrefix';
import { SwapNodeHelper } from './SwapNodesHelper';

export class RewriteMerklePatriciaTrie {
  private database = new InMemoryDatabase();

  private root: Node = new EmptyNode();

  public traverse(key: string): string | null {
    let bufferKey = convertBytesToNibbles(Buffer.from(key));
    let currentNode: Node = this.root;
    while (bufferKey.length) {
      if (currentNode.type === NodeType.BRANCH_NODE) {
        const nextKey = (currentNode as BranchNode).get(bufferKey[0]);
        let nextNode: Node;
        if (Buffer.isBuffer(nextKey)) {
          const value = nextKey;
          nextNode = convertRlpNodeToNode({
            key: Buffer.alloc(0),
            value: this.database.retrieve(value),
          });
        } else {
          throw new Error('Unknown state');
        }

        currentNode = nextNode;
        bufferKey = bufferKey.slice(1);
      } else if (currentNode.type === NodeType.LEAF_NODE) {
        return (currentNode as LeafNode).value.toString('utf8');
      } else if (currentNode.type === NodeType.EXTENSION_NODE) {
        const node = currentNode;
        currentNode = convertRlpNodeToNode({
          key: Buffer.alloc(0),
          value: this.database.retrieve(node.value),
        });

        // TODO: Fix this bug
        bufferKey = bufferKey.slice(node.key.length || 1);
      } else {
        throw new Error('Not implemented');
      }
    }

    if (currentNode) {
      return currentNode.value.toString('utf-8');
    } else {
      return null;
    }
  }

  public insert(key: string, value: string) {
    const bufferKey = convertBytesToNibbles(Buffer.from(key));
    const bufferValue = Buffer.from(value);

    const simpleTrieExplorer = new SimpleTrie(this.root);

    simpleTrieExplorer.traverse({
      key: bufferKey,
      callback: ({ node, key }) => {
        if (node.type === NodeType.EMPTY_NODE) {
          const newNode = new LeafNode({
            key: key,
            value: bufferValue,
          });
          return {
            node: newNode,
            consumedKeyLength: key.length,
          };
        } else if (node.type === NodeType.LEAF_NODE) {
          const commonPrefix = new GetCommonPrefixResult().commonPrefixLength({
            key1: (node as LeafNode).key,
            key2: key,
          });

          if (commonPrefix.type === CommonPrefixResultType.KEY1_PREFIX) {
            const newNode = new SwapNodeHelper(
              this.database
            ).swapLeafWithExtension({
              key,
              value: bufferValue,
              node,
              prefix: commonPrefix.prefix,
            });

            return {
              node: newNode,
              consumedKeyLength: key.length,
            };
          } else {
            throw new Error(`Case not handled yet ${commonPrefix.type}`);
          }
        } else if (node.type === NodeType.EXTENSION_NODE) {
          const commonPrefix = new GetCommonPrefixResult().commonPrefixLength({
            key1: node.key,
            key2: key,
          });
          if (!commonPrefix.type && commonPrefix.prefix.length) {
            const newExtensionNode = new SwapNodeHelper(
              this.database
            ).swapExtensionNOdeWithBranchNode({
              key,
              value: bufferValue,
              node,
              prefix: commonPrefix.prefix,
            });

            return {
              node: newExtensionNode,
              consumedKeyLength: key.length,
            };
          } else if (commonPrefix.type === CommonPrefixResultType.KEY1_PREFIX) {
            const nextNode = this.retrieveNode({
              hash: node.value,
            });

            return {
              node: nextNode,
              consumedKeyLength: node.key.length,
            };
          }
        } else if (node.type === NodeType.BRANCH_NODE) {
          const branchNode = node as BranchNode;

          const branchKeyIndex = key[0];
          if (branchNode.rawValues[branchKeyIndex]) {
            const node = this.retrieveNode({
              hash: branchNode.rawValues[branchKeyIndex],
            });
            if (node.type === NodeType.LEAF_NODE) {
              const leafNode = node;
              const currentKey = key.slice(1);

              const commonPrefix =
                new GetCommonPrefixResult().commonPrefixLength({
                  // TODO: Fix bug that causes old key to be part of current key
                  key1: leafNode.key.slice(1),
                  key2: currentKey,
                });

              if (commonPrefix.type === CommonPrefixResultType.KEY1_PREFIX) {
                const newBranchNode = new SwapNodeHelper(
                  this.database
                ).swapLeafNodeOnBranch({
                  key: currentKey,
                  value: bufferValue,
                  node: branchNode,
                  branchKeyIndex,
                  leafNode,
                  prefix: commonPrefix.prefix,
                });

                return {
                  node: newBranchNode,
                  consumedKeyLength: key.length,
                };
              }
            }
          } else {
            throw new Error('Should only need to insert item again!');
          }
        }

        throw new Error(`Case not handled yet ${node.type}`);
      },
    });
    this.root = simpleTrieExplorer.newRoot;
  }

  public retrieveNode({ hash }: { hash: Buffer }): Node {
    if (hash.length < 32) {
      return convertRlpNodeToNode({
        key: Buffer.alloc(0),
        value: hash,
      });
    }
    return convertRlpNodeToNode({
      key: Buffer.alloc(0),
      value: this.database.retrieve(hash),
    });
  }

  public get trieRoot() {
    return this.root;
  }
}
