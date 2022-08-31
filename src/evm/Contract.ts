import BigNumber from 'bignumber.js';
import crypto from 'crypto';
import { TxContext } from './Evm';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { keccak256 } from '../utils/keccak256';
import { RlpEncoder } from '../rlp';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { Address } from './Address';
import { convertNumberToPadHex } from '../utils/convertNumberToPadHex';
import { ForkedEvm } from './EvmSubContextCall';

export class Contract {
  private context: {
    address?: string;
    returnData?: Buffer;
    isDeployed?: boolean;
  } = {};

  constructor(
    private options: {
      program: Buffer;
      value: BigNumber;
      context: TxContext;
      salt?: Buffer;
    }
  ) {
    const { context, program, salt } = options;

    // https://ethereum.stackexchange.com/a/101340
    // https://www.evm.codes/#f0
    const rlp = getClassFromTestContainer(RlpEncoder);
    const encoding = rlp.encode({
      input: [context.sender.raw || crypto.randomBytes(32), context.nonce],
    });
    if (salt) {
      const dataHash = keccak256(program);
      const address = keccak256(
        getBufferFromHex(
          `0xff${convertNumberToPadHex(
            context.sender.raw.toString(16)
          )}${salt?.toString('hex')}${dataHash.toString('hex')}`
        )
      );
      this.context.address = '0x' + address.slice(12).toString('hex');
    } else {
      this.context.address =
        '0x' + keccak256(getBufferFromHex(encoding)).slice(12).toString('hex');
    }
  }

  public async execute(options: ForkedEvm) {
    const results = await options.executor({
      program: this.options.program,
    });

    const callResults = results.callingContextReturnData;

    if (callResults && !this.context.isDeployed) {
      this.context.returnData = callResults;
      this.options.program = callResults;
      this.context.isDeployed = true;
    } else if (!this.context.isDeployed) {
      this.options.program = Buffer.alloc(0);
    }

    return this;
  }

  // TODO: I don't like having these variables encapsulated like this.
  // Ideally it should be settable inside, and exposed as readonly.
  // Maybe you can do some trick with proxy.
  public get value() {
    return this.options.value;
  }

  public get length() {
    return this.options.program.length;
  }

  public get data() {
    return this.options.program;
  }

  public get address() {
    return new Address(this.context.address);
  }

  public get returnData() {
    return this.context.returnData;
  }
}
