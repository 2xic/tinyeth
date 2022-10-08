import { getBufferFromHex } from '../../../../utils/getBufferFromHex';
import { sha3_256 } from '../../../../utils/sha3_256';
import { RlpEncoder } from '../../../../rlp/RlpEncoder';
import { MerklePatriciaTrieHelper } from '../MerklePatriciaTrieHelper';
import { TrieNodeRawKeyValue } from './TrieNodeRawKeyValue';
import { TrieNodeRawValue } from './TrieNodeRawValue';
import { TrieNodeReference } from './TrieNodeReference';

/*
  TODO:
    TrieNode is currently a mess, and should be simplified.
      - For instance the options that can be sent into the constructor should be simplified
        - remove skipConverting
        - remove rawNodeValue
      - I think it's "nice" if we follow the pattern described in https://eth.wiki/fundamentals/patricia-tree for the trie node names (null, branch, leaf, extension)
 */
export class TrieNode {
  private children: Array<
    TrieNode | TrieNodeRawValue | TrieNodeRawKeyValue | TrieNodeReference | ''
  > = [];

  private _key?: Buffer;

  private _value?: string;

  private _rawKey?: Buffer;

  private _rawValue?: Buffer;

  constructor(
    private options?: {
      key: Buffer;
      value: Buffer;
      skipConverting?: boolean;
      rawNodeValue?: (string | Buffer | (string | Buffer)[])[];
    }
  ) {
    const _key = options?.key
      ? new MerklePatriciaTrieHelper().convertKey({
          input: options.key,
        })
      : undefined;
    this._key = _key;
    const _value = options
      ? new MerklePatriciaTrieHelper().encodeKeyAndValue({
          key: options.key,
          value: options.value,
          skipConverting: options.skipConverting,
        })
      : undefined;
    this._value = _value;

    this._rawValue = options?.value;
    this._rawKey = options?.key;

    this.children = [];
  }

  public seedEmptyNodes() {
    this.children = [...new Array(16)].map(() => '');
  }

  public insertNode(
    index: string,
    node: TrieNode | TrieNodeReference | TrieNodeRawKeyValue | TrieNodeRawValue
  ) {
    let intIndex = parseInt(index);
    if (intIndex < 0) {
      intIndex = 15 - intIndex;
    }
    if (0 > intIndex && intIndex > 15) {
      throw new Error('Index out of range');
    }
    if (this.children[intIndex]) {
      throw new Error('Children value already set');
    }
    this.children[intIndex] = node;
  }

  public get value() {
    return this._value;
  }

  public get rawKey() {
    if (!this._rawKey) {
      throw new Error('trie node has a undefined raw key');
    }
    return this._rawKey;
  }

  public get rawValue() {
    if (!this._rawValue) {
      throw new Error('trie node has a undefined raw value');
    }
    return this._rawValue;
  }

  public get hash(): string {
    let value = this.value;
    if (this.options?.rawNodeValue) {
      value = new RlpEncoder().encode({
        input: [this.options.key, this.options.rawNodeValue],
      });
    }
    return sha3_256(getBufferFromHex(value || '')).toString('hex');
  }

  public get type(): NodeType {
    if (this.value === undefined) {
      return NodeType.UNINITIALIZED;
    } else if (this.value) {
      return NodeType.LEAF;
    } else if (this.options?.rawNodeValue) {
      return NodeType.BRANCH;
    }
    return NodeType.UNKNOWN;
  }

  public get key() {
    if (!this._key) {
      throw new Error('No key set on the trie');
    }
    return this._key;
  }

  public get childrenValues(): Array<string | Buffer | Array<string | Buffer>> {
    if (this.options?.rawNodeValue) {
      return this.options.rawNodeValue;
    }
    const values = this.children.map((item) => {
      if (item instanceof TrieNode) {
        if (!item.value) {
          throw new Error('unknown value');
        }
        return item.value;
      } else if (typeof item == 'string') {
        return item;
      } else if (item instanceof TrieNodeReference) {
        return item.hash;
      } else if (item instanceof TrieNodeRawValue) {
        return item.value;
      } else if (item instanceof TrieNodeRawKeyValue) {
        return [item.key, item.value];
      } else {
        throw new Error('Unknown trie node type');
      }
    });

    return values;
  }
}

export enum NodeType {
  UNKNOWN,
  LEAF,
  UNINITIALIZED,
  BRANCH,
}
