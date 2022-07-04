import BigNumber from 'bignumber.js';
import { Uint } from '../../rlp/types/Uint';

export class UintType extends Uint {
  constructor(value: number | BigNumber) {
    super({
      input: new BigNumber(value),
      n: 256,
      type: 'uint8',
    });
  }
}
