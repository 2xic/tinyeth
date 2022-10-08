import { buf } from 'crc-32/*';
import { ExtensionHelper } from 'typescript-logging';
import { InMemoryDatabase } from '../utils/InMemoryDatabase';
import { CommonPrefixResultType } from './deprecated-old/MerklePatriciaTrieHelper';
import { BranchNode } from './nodes/BranchNode';
import { EmptyNode } from './nodes/EmptyNode';
import { convertRlpNodeToNode } from './nodes/convertRlpNodeToNode';
import { ExtensionNode } from './nodes/ExstensionNode';
import { LeafNode } from './nodes/LeafNode';
import { Node, NodeType } from './nodes/Node';
import { SimpleTrie } from './SImpleTrie';
import { convertBytesToNibbles } from './utils/convertBytesToNibbles';
import { GetCommonPrefixResult } from './utils/GetCommonPrefix';
import { convertToObject, ExitStatus } from 'typescript';
import { allocUnsafe } from 'bun';

export class RewriteMerklePatriciaTrie {
  private database = new InMemoryDatabase();

  private root: Node = new EmptyNode();

  public traverse(key: string): string | null {
    /*
        Travel down the tree
    */
    let bufferKey = convertBytesToNibbles(Buffer.from(key));
    let currentNode: Node = this.root;
    while (bufferKey.length) {
      console.log({
        currentNodeType: currentNode.type,
        currentNodeKey: (currentNode as any).key,
        currentKeyBuffer: bufferKey,
      });
      if (currentNode.type === NodeType.BRANCH_NODE) {
        //console.log({ currentNode });
        //console.log((currentNode as any).children);
        //        console.log(bufferKey);

        const nextKey = (currentNode as BranchNode).get(bufferKey[0]);
        let nextNode: Node;
        if (Buffer.isBuffer(nextKey)) {
          const value = nextKey;
          nextNode = convertRlpNodeToNode({
            // This is not correct
            // at this point the key should be equal to the traversed key
            // But it does not matter in this case, because it's a reconstruction
            // but should be fixed anyways
            key: bufferKey,
            value: this.database.retrieve(value),
            inMemoryDatabase: this.database,
          });
        } else {
          console.log({
            bufferKey,
            nextKey,
          });
          /*
          console.log(bufferKey[0]);
          console.log({ nextKey });*/
          throw new Error('Unknown state');
          break;
        }

        currentNode = nextNode;
        bufferKey = bufferKey.slice(1);
      } else if (currentNode.type === NodeType.LEAF_NODE) {
        //   console.log(currentNode.rawValues);
        return (currentNode as LeafNode).value.toString('utf8');
      } else if (currentNode.type === NodeType.EXTENSION_NODE) {
        const node = currentNode as ExtensionNode;
        currentNode = convertRlpNodeToNode({
          key: node.key,
          value: this.database.retrieve(node.value),
          inMemoryDatabase: this.database,
        });
        /*
        //console.log({
          currentNode,
          bufferKey,
        });*/
        bufferKey = bufferKey.slice(node.key.length);
        /*//console.log({
          bufferKey,
          type: currentNode.type,
        });*/
      } else {
        //console.log(currentNode.type);
        throw new Error('Not implemented');
      }
    }

    if (currentNode) {
      return (currentNode as LeafNode).value.toString('utf-8');
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
            const branchNode = new BranchNode({
              key: (node as LeafNode).key,
              value: (node as LeafNode).value,
            });

            const keyValue = key[commonPrefix.prefix.length];
            const leafNode = new LeafNode({
              key: key.slice(commonPrefix.prefix.length),
              value: bufferValue,
            });

            branchNode.insert(keyValue, leafNode.nodeKey);

            //          //console.log(branchNode.nodeValue);
            //            //console.log(branchNode.nodeKey);

            this.database.insert({
              key: branchNode.nodeKey,
              value: branchNode.nodeValue,
            });

            this.database.insert({
              key: leafNode.nodeKey,
              value: leafNode.nodeValue,
            });

            const newNode: ExtensionNode = new ExtensionNode({
              key: commonPrefix.prefix,
              value: branchNode.nodeKey,
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
            key1: (node as ExtensionNode).key,
            key2: key,
          });
          if (!commonPrefix.type && commonPrefix.prefix.length) {
            // Need to split up the node.
            const branchNode = new BranchNode({
              key: Buffer.alloc(0),
              value: Buffer.alloc(0),
            });

            const oldExtensionNodeKey = (node as ExtensionNode).key.slice(
              commonPrefix.prefix.length
            );
            const oldExtensionNode = new ExtensionNode({
              key: oldExtensionNodeKey.slice(1),
              value: (node as ExtensionNode).value,
            });

            const newLeafNode = new LeafNode({
              key: Buffer.alloc(0),
              value: bufferValue,
            });

            const oldExtensionNodeKeyValue = oldExtensionNodeKey[0];
            branchNode.insert(
              oldExtensionNodeKeyValue,
              oldExtensionNode.nodeKey
            );
            const leafNOdeKeyValue = key.slice(commonPrefix.prefix.length)[0];
            branchNode.insert(leafNOdeKeyValue, newLeafNode.nodeKey);

            const newExtensionNode = new ExtensionNode({
              key: commonPrefix.prefix,
              value: branchNode.nodeKey,
            });

            this.database.insert({
              key: branchNode.nodeKey,
              value: branchNode.nodeValue,
            });

            this.database.insert({
              key: newLeafNode.nodeKey,
              value: newLeafNode.nodeValue,
            });

            this.database.insert({
              key: oldExtensionNode.nodeKey,
              value: oldExtensionNode.nodeValue,
            });

            return {
              node: newExtensionNode,
              consumedKeyLength: key.length,
            };
          } else if (commonPrefix.type === CommonPrefixResultType.KEY1_PREFIX) {
            const nextNode = this.retrieveNode({
              hash: (node as ExtensionNode).value,
            });

            return {
              node: nextNode,
              consumedKeyLength: (node as ExtensionNode).key.length,
            };
          } else {
            throw new Error(
              `Case not handled yet ${
                commonPrefix.type
              } -> ${commonPrefix.prefix.toString('hex')}`
            );
          }
        } else if (node.type === NodeType.BRANCH_NODE) {
          const branchNode = node as BranchNode;
          console.log({ node });

          const branchKeyIndex = key[0];
          if (branchNode.rawValues[branchKeyIndex]) {
            const node = this.retrieveNode({
              hash: branchNode.rawValues[branchKeyIndex],
            });
            if (node.type === NodeType.LEAF_NODE) {
              const leafNode = node as LeafNode;
              /*
                You basically have to rerun the merging logic that is done above
              */
              // TODO: FIx bug that causes old key to be part of current key
              const currentKey = key.slice(1);

              //.key = leafNode.key.slice(1);

              const commonPrefix =
                new GetCommonPrefixResult().commonPrefixLength({
                  key1: leafNode.key.slice(1),
                  key2: currentKey,
                });
              if (commonPrefix.type === CommonPrefixResultType.KEY1_PREFIX) {
                const newLeafKey = leafNode.key.slice(
                  1 + commonPrefix.prefix.length
                );
                const newBranchNode = new BranchNode({
                  key: Buffer.alloc(0),
                  value: newLeafKey.length ? Buffer.alloc(0) : leafNode.value,
                });

                if (newLeafKey.length) {
                  throw new Error(
                    'has to insert the leaf key node into a new branch'
                  );
                }

                const keyIndex = currentKey.slice(commonPrefix.prefix.length);
                const newLeafNode = new LeafNode({
                  key,
                  value: bufferValue,
                });
                newBranchNode.insert(keyIndex[0], newLeafNode.nodeKey);

                const extensionNode = new ExtensionNode({
                  key: commonPrefix.prefix,
                  value: newBranchNode.nodeKey,
                });

                this.database.insert({
                  key: newBranchNode.nodeKey,
                  value: newBranchNode.nodeValue,
                });

                branchNode.insert(branchKeyIndex, extensionNode.nodeKey, true);
                //   branchNode.insert(2, Buffer.from('deadbeef', 'hex'));

                this.database.insert({
                  key: branchNode.nodeKey,
                  value: branchNode.nodeValue,
                });

                this.database.insert({
                  key: extensionNode.nodeKey,
                  value: extensionNode.nodeValue,
                });

                this.database.insert({
                  key: newLeafNode.nodeKey,
                  value: newLeafNode.nodeValue,
                });

                this.database.insert({
                  key: newBranchNode.nodeKey,
                  value: newBranchNode.nodeValue,
                });

                /*
                console.log({
                  pnada: this.retrieveNode({
                    hash: branchNode.rawValues[6],
                  }),
                  aaa: this.retrieveNode({
                    hash: extensionNode.nodeKey,
                  }),
                        newBranchNodeVal: newBranchNode.value.toString('utf8'),
                  newBranchNode,
                  branchKeyIndex,
                });
                */
                return {
                  node: branchNode,
                  consumedKeyLength: key.length,
                };
              } else {
                throw new Error(`Add prefix support ${commonPrefix.type}`);
              }
            }

            throw new Error(`Reinsert items.. ${node.type}`);
          } else {
            throw new Error('Should only need to insert item again!');
          }
        } else {
          throw new Error(`Case not handled yet ${node.type}`);
        }
      },
    });
    this.root = simpleTrieExplorer.newRoot;
  }

  public retrieveNode({ hash }: { hash: Buffer }): Node {
    return convertRlpNodeToNode({
      key: Buffer.alloc(0),
      value: this.database.retrieve(hash),
      inMemoryDatabase: this.database,
    });
  }

  public get trieRoot() {
    return this.root;
  }
}
