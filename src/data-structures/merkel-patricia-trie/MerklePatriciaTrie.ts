/* eslint-disable @typescript-eslint/no-unused-vars */
import { convertBytesToNibbles } from './convertBytesToNibbles';
import { InMemoryDatabase } from '../utils/InMemoryDatabase';
import { MerklePatriciaTrieHelper } from './MerklePatriciaTrieHelper';
import { packNibbles } from './packNibbles';
import { addTerminator, removeTerminator } from './terminatorUtils';
import { NodeType, TrieNode } from './TrieNode';
import { TrieNodeRawKeyValue } from './TrieNodeRawKeyValue';
import { TrieNodeRawValue } from './TrieNodeRawValue';
import { unpackNibbles } from './unpackNibbles';

export class MerklePatriciaTrie {
  private _root: TrieNode;

  private database: InMemoryDatabase;

  constructor() {
    this._root = new TrieNode(undefined);
    this.database = new InMemoryDatabase();
  }

  public get(key: Buffer): { found: boolean; value?: Buffer } {
    throw new Error('Not implemented');
  }

  public put(key: Buffer, value: Buffer): { success: boolean } {
    if (this._root.type === NodeType.UNINITIALIZED) {
      this._root = new TrieNode({
        key,
        value,
      });
    } else if (this._root.type === NodeType.LEAF) {
      this._root = this.updateTrie({
        node: this._root,
        key: convertBytesToNibbles(key),
        value,
      });
    }

    return {
      success: true,
    };
  }

  public del(key: Buffer): { success: boolean } {
    throw new Error('Not implemented');
  }

  public get hash(): string {
    throw new Error('Not implemented');
  }

  public get rootHash(): string {
    return this._root.hash;
  }

  private updateTrie({
    node,
    key,
    value,
  }: {
    node: TrieNode;
    key: Buffer;
    value: Buffer;
  }) {
    const currentKey = removeTerminator(unpackNibbles(node.key));

    const commonPrefixResult =
      new MerklePatriciaTrieHelper().commonPrefixLength({
        key1: key,
        key2: currentKey,
      });

    if (!commonPrefixResult.type) {
      const newNode = new TrieNode();
      newNode.seedEmptyNodes();

      const remainingKey = key.slice(commonPrefixResult.length);
      const remainingCurrentKey = currentKey.slice(commonPrefixResult.length);

      if (!remainingCurrentKey.length) {
        newNode.seedEmptyNodes();
        newNode.addNode('-1', new TrieNodeRawValue(node.rawValue));
        newNode.addNode(
          remainingKey[0].toString(),
          new TrieNodeRawKeyValue(
            packNibbles(addTerminator(remainingKey.slice(1))),
            value
          )
        );
      }

      /*
      newNode.addNode(
        remainingKey[0].toString(),
        new MerklePatriciaTrieHelper().encodeNode({
          key: packNibbles(addTerminator(remainingKey)),
          value,
        })
      );

      const keySource = remainingCurrentKey.length
        ? remainingCurrentKey
        : remainingKey;

      newNode.addNode(
        keySource[0].toString(),
        new MerklePatriciaTrieHelper().encodeNode({
          key: packNibbles(addTerminator(keySource)),
          value: node.rawValue,
        })
      );
      */

      if (!commonPrefixResult.length) {
        return newNode;
      } else {
        const value = new MerklePatriciaTrieHelper().encodeNodeChildren(
          newNode.childrenValues
        );

        if (value instanceof TrieNode) {
          throw new Error('Not supported');
        }

        return new TrieNode({
          key: packNibbles(currentKey.slice(0, commonPrefixResult.length)),
          value: value,
          skipConverting: true,
        });
      }
    }
    throw new Error('Not implemented');
  }

  public get root(): TrieNode {
    return this._root;
  }
}
