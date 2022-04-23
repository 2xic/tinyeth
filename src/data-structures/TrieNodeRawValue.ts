export class TrieNodeRawValue {
  constructor(private _value: Buffer) {}

  public get value() {
    return this._value;
  }
}
