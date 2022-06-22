import BigNumber from 'bignumber.js';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
export class Contract {
  private _address: string;

  private _length: number;

  // TODO : Wrong address construction here
  //        see https://ethereum.stackexchange.com/a/101340
  //            https://www.evm.codes/#f0
  //        address = keccak256(rlp([sender_address,sender_nonce]))[12:]
  constructor(
    private bytes: Buffer,
    private _value: BigNumber,
    private keyPair = new KeyPair(crypto.randomBytes(32).toString('hex'))
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
