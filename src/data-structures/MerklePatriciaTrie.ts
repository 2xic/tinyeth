import { RlpDecoder } from '../rlp/RlpDecoder';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { TrieNode } from './TrieNode';

export class MerklePatriciaTrie {
  private _rootHash: string | undefined;

  private root: TrieNode;

  constructor() {
    this.root = new TrieNode('');
    this._rootHash = undefined;
  }

  public get(key: Buffer): { found: boolean; value?: Buffer } {
    throw new Error('Not implemented');
  }

  public put(key: Buffer, value: Buffer): { success: boolean } {
    this.root = new TrieNode(new RlpEncoder().encode({ input: value }));

    return {
      success: true,
    };
    /*    const node = this.root;
    for (const keyByte of key.toString('hex')) {
      node = node.addNode(keyByte, );
    }
    this._rootHash = node.hash:*/
  }

  public del(key: Buffer): { success: boolean } {
    throw new Error('Not implemented');
  }

  public get hash(): string {
    throw new Error('Not implemented');
  }

  public get rootHash(): string {
    return this.root.hash;
  }
}
