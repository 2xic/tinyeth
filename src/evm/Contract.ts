import BigNumber from 'bignumber.js';
import crypto from 'crypto';
import { Evm, TxContext } from './Evm';
import { Wei } from './Wei';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { keccak256 } from '../utils/keccak256';
import { RlpEncoder } from '../rlp';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { Address } from './Address';
import { convertNumberToPadHex } from '../utils/convertNumberToPadHex';
import { EvmMemory } from './EvmMemory';
import { ExposedEvm } from './ExposedEvm';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

export class Contract {
  private _address: string;
  private _returnData?: Buffer;

  constructor(
    private bytes: Buffer,
    private _value: BigNumber,
    private context: TxContext,
    private salt?: Buffer // private evm?: Evm
  ) {
    // https://ethereum.stackexchange.com/a/101340
    // https://www.evm.codes/#f0
    const rlp = getClassFromTestContainer(RlpEncoder);
    const encoding = rlp.encode({
      input: [context.sender.raw || crypto.randomBytes(32), context.nonce],
    });
    if (this.salt) {
      const dataHash = keccak256(bytes);
      const address = keccak256(
        getBufferFromHex(
          `0xff${convertNumberToPadHex(
            context.sender.raw.toString(16)
          )}${salt?.toString('hex')}${dataHash.toString('hex')}`
        )
      );
      this._address = '0x' + address.slice(12).toString('hex');
    } else {
      this._address =
        '0x' + keccak256(getBufferFromHex(encoding)).slice(12).toString('hex');
    }
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
    return new Address(this._address);
  }

  public execute(
    options: Partial<TxContext> & {
      evm?: Evm;
    }
  ) {
    // This should be done in another way -> Redo this in a better way.
    // The result of this execution will also effect the previous context, so we need to be able to continue in same context.
    // by having it in a different container this is not the case.
    // I think that all access sets done in this new contract also will affect the ones in the current context.
    const data = options.data || Buffer.from('');
    const evm = getClassFromTestContainer(ExposedEvm);
    if (options.evm) {
      evm.copy(options.evm);
    }
    evm
      .boot(
        this.bytes,
        {
          value: new Wei(this.value.toNumber()),
          data,
          nonce: 0,
          sender: this.context.sender,
          gasLimit: this.context.gasLimit,
        },
        { debug: false }
      )
      .execute();
    if (evm.callingContextReturnData) {
      this._returnData = evm.callingContextReturnData;
      this.bytes = evm.callingContextReturnData;
    }

    return this;
  }

  public get returnData() {
    return this._returnData;
  }
}
