import { Uint } from '../../rlp/types/Uint';
import { AddressType } from './AddressType';
import { ArrayType } from './ArrayType';
import { StringType } from './StringType';
import { UintType } from './UintType';

export class AbiStruct {
  constructor(
    public struct: Array<Uint | ArrayType | StringType | AddressType>
  ) {}

  public get value() {
    const items = this.struct.find((item) => item instanceof ArrayType)
      ? this.struct // [new UintType(0x20), ...this.struct]
      : this.struct;

    return {
      encoding: items
        .map((item) => {
          return item.value.encoding;
        })
        .join(''),
    };
  }

  public get type() {
    return `(${this.struct.map((item) => item.type).join(',')})`;
  }

  public get encoding() {
    return this.value.encoding;
  }
}
