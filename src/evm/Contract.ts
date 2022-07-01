import BigNumber from 'bignumber.js';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { Evm } from './Evm';
import { Wei } from './Wei';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';

export class Contract {
  private _address: string;

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
  }

  public get value() {
    return this._value;
  }

  public get length() {
    return this.bytes.length;
  }

  public get data() {
    return this.bytes;
  }

  public get address() {
    return this._address;
  }

  public execute() {
    // This should be done in another way -> Redo this in a better way.
    // The result of this execution will also effect the previous context, so we need to be able to continue in same context.
    // by having it in a different container this is not hte case.
    // I think that all access sets done in this new contract also will affect the ones in the current context.
    const evm = getClassFromTestContainer(Evm)
      .boot(this.bytes, {
        value: new Wei(this.value.toNumber()),
        data: Buffer.from(''),
        nonce: 0,
      })
      .execute();
    if (evm.callingContextReturnData) {
      this.bytes = evm.callingContextReturnData;
    }

    return this;
  }
}
