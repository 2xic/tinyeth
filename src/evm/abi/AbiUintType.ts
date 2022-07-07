import BigNumber from 'bignumber.js';
import { Uint } from '../../rlp/types/Uint';

export class AbiUintType extends Uint {
  constructor(value: number | BigNumber | string, n = 256) {
    super({
      input: new BigNumber(value),
      n: 256,
      type: 'uint8',
    });
  }

  public get value() {
    const output = this.getByteArray({
      ...this.options,
    });
    return {
      ...output,
      encoding: output.encoding.padStart(64, '0'),
    };
  }
}
