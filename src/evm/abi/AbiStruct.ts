import { Uint } from '../../rlp/types/Uint';
import { AddressType } from './AddressType';
import { ArrayType } from './ArrayType';
import { StringType } from './StringType';

export class AbiStruct {
  constructor(
    public struct: Array<Uint | ArrayType | StringType | AddressType>
  ) {}

  public get value() {
    return {
      encoding: this.struct.map((item) => item.value.encoding).join(''),
    };
  }

  public get type() {
    return `(${this.struct.map((item) => item.type).join(',')})`;
  }

  public get encoding() {
    return this.value.encoding;
  }
}
