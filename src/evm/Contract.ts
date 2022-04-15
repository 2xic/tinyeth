import BigNumber from 'bignumber.js';
import { KeyPair } from '../signatures/KeyPair';

export class Contract {
  private _address: string;

  private _length: number;

  // TODO : Wrong address construction here
  //        see https://ethereum.stackexchange.com/a/101340
  constructor(
    private bytes: Buffer,
    private _value: BigNumber,
    private keyPair = new KeyPair()
  ) {
    this._address = keyPair.getAddress({
      publicKey: this.keyPair.getPublicKey(),
    });
    this._length = bytes.length;
  }

  public get value() {
    return this._value;
  }

  public get length() {
    return this._length;
  }

  public get address() {
    return this._address;
  }
}
