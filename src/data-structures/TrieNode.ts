import { keccak256 } from '../network/keccak256';

export class TrieNode {
  private children: Record<string, TrieNode> = {};

  private _value: string;

  constructor(value: string) {
    this.children = {};
    this._value = value;
  }

  public addNode(index: string, node: TrieNode) {
    const intIndex = parseInt(index);
    if (0 > intIndex && intIndex > 16) {
      throw new Error('Index out of range');
    }
    this.children[index] = node;
  }

  public get value() {
    return this._value;
  }

  public get hash(): string {
    return keccak256(Buffer.from(this._value, 'ascii')).toString('hex');
  }
}
