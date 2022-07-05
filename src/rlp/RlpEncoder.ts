import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { UintType } from '../evm/abi/UintType';
import { EncodeToken } from './EncodeToken';

@injectable()
export class RlpEncoder {
  public encode({ input }: { input: InputTypes }) {
    const hexPrefix = '0x';
    const encoded = new EncodeToken().encodeToken({ input }).encoding;
    return hexPrefix + encoded;
  }
}

export type InputTypes = Literal | Literal[];
export type Literal =
  | string
  | number
  | boolean
  | BigNumber
  | Uint8Array
  | UintType
  | Array<Literal>;
