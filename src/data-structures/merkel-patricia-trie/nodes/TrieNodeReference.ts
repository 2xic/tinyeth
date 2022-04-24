export class TrieNodeReference {
  constructor(private _hash: Buffer) {}

  public get hash() {
    return this._hash;
  }

  public get key() {
    return this.hash;
  }
}
