/* eslint-disable @typescript-eslint/no-unused-vars */
import { convertBytesToNibbles } from '../utils/convertBytesToNibbles';
import { InMemoryDatabase } from '../../utils/InMemoryDatabase';
import {
  CommonPrefixResultType,
  MerklePatriciaTrieHelper,
} from './MerklePatriciaTrieHelper';
import { packNibbles } from '../utils/packNibbles';
import { addTerminator, removeTerminator } from '../utils/terminatorUtils';
import { NodeType, TrieNode } from './nodes/TrieNode';
import { TrieNodeRawKeyValue } from './nodes/TrieNodeRawKeyValue';
import { TrieNodeRawValue } from './nodes/TrieNodeRawValue';
import { unpackNibbles } from '../utils/unpackNibbles';
import { RlpEncoder } from '../../../rlp';

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
    let createdNode: TrieNode;
    if (this._root.type === NodeType.UNINITIALIZED) {
      this._root = new TrieNode({
        key,
        value,
      });
      createdNode = this._root;
    } else if (this._root.type === NodeType.LEAF) {
      this._root = this.updateTrie({
        node: this._root,
        key: convertBytesToNibbles(key),
        value,
      });
      createdNode = this._root;
    } else if (this._root.type === NodeType.BRANCH) {
      throw new Error('oh no');
    } else {
      throw new Error('Unknown state');
    }

    // eslint-disable-next-line no-console
    console.log(['child values', this._root.childrenValues]);
    /*
    this.database.insert({
      key: createdNode.hash,
      value: new RlpEncoder().encode({
        input: createdNode.childrenValues,
      }),
    });
    */
    return {
      success: true,
    };
  }

  public del(key: Buffer): { success: boolean } {
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

    const remainingKey = key.slice(commonPrefixResult.length);
    const remainingCurrentKey = currentKey.slice(commonPrefixResult.length);

    if (commonPrefixResult.type === CommonPrefixResultType.KEY2_PREFIX) {
      const newNode = new TrieNode();
      if (!remainingCurrentKey.length) {
        newNode.seedEmptyNodes();
        newNode.insertNode('-1', new TrieNodeRawValue(node.rawValue));
        newNode.insertNode(
          remainingKey[0].toString(),
          new TrieNodeRawKeyValue(
            packNibbles(addTerminator(remainingKey.slice(1))),
            value
          )
        );
      }

      if (!commonPrefixResult.length) {
        return newNode;
      } else {
        const value = new MerklePatriciaTrieHelper().encodeNodeChildren(
          newNode.childrenValues
        );

        if (Array.isArray(value)) {
          return new TrieNode({
            key: packNibbles(currentKey.slice(0, commonPrefixResult.length)),
            value: Buffer.from([]),
            rawNodeValue: value,
          });
        }

        return new TrieNode({
          key: packNibbles(currentKey.slice(0, commonPrefixResult.length)),
          value: value,
          skipConverting: true,
        });
      }
    } else if (!commonPrefixResult.type) {
      if (remainingCurrentKey.length == 1) {
        throw new Error('Not dealt with');
      }

      const newNode = new TrieNode();
      newNode.seedEmptyNodes();
      newNode.insertNode(
        remainingCurrentKey[0].toString(),
        new TrieNode({
          key: packNibbles(addTerminator(remainingCurrentKey.slice(1))),
          value: Buffer.from([]),
          rawNodeValue: node.childrenValues,
        })
      );
      if (remainingKey.length === 0) {
        throw new Error('Not dealt with');
      } else {
        newNode.insertNode(
          remainingKey[0].toString(),
          new TrieNodeRawKeyValue(
            packNibbles(addTerminator(remainingKey.slice(1))),
            value
          )
        );
      }
      // eslint-disable-next-line no-console
      console.log(['children values', newNode.childrenValues]);
      return new TrieNode({
        key: packNibbles(currentKey.slice(0, commonPrefixResult.length)),
        value: value,
        skipConverting: true,
      });
    }
    throw new Error(`Not implemented handling of ${commonPrefixResult.type}`);
  }

  public get root(): TrieNode {
    return this._root;
  }
}
