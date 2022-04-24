export class TrieNodeRawKeyValue {
  constructor(private _key: Buffer, private _value: Buffer) {}

  public get key() {
    return this._key;
  }

  public get value() {
    return this._value;
  }
}
