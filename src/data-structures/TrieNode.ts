import { getBufferFromHex } from '../network/getBufferFromHex';
import { keccak256 } from '../network/keccak256';

export class TrieNode {
  private children: Array<TrieNode | ''> = [];

  private _value: string;

  constructor(value: string, private _level = 0) {
    this.children = [];
    this._value = value;
  }

  public addNode(index: string, node: TrieNode) {
    const intIndex = parseInt(index);
    if (0 > intIndex && intIndex > 16) {
      throw new Error('Index out of range');
    }
    this.children[intIndex] = node;
  }

  public get value() {
    return this._value;
  }

  public get level() {
    return this._level;
  }

  public get hash(): string {
    return keccak256(getBufferFromHex(this._value)).toString('hex');
  }
}
