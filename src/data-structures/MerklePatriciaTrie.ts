import { RlpDecoder } from '../rlp/RlpDecoder';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { addTerminator } from './addTerminator';
import { convertBytesToNibbles } from './convertBytesToNibbles';
import { MerklePatriciaTrieHelper } from './MerklePatriciaTrieHelper';
import { packNibbles } from './packNibbles';
import { TrieNode } from './TrieNode';

export class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode('');
  }

  public get(key: Buffer): { found: boolean; value?: Buffer } {
    throw new Error('Not implemented');
  }

  public put(inputKey: Buffer, value: Buffer): { success: boolean } {
    const data = new MerklePatriciaTrieHelper().encodeKeyAndValue({
      key: inputKey,
      value: value,
    });
    this.root = new TrieNode(data);

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
    return this.root.hash;
  }
}
