import { Uint } from '../../rlp/types/Uint';

export class AbiStruct {
  constructor(public struct: Uint[]) {}

  public get value() {
    return {
      encoding: this.struct.map((item) => item.value.encoding).join(''),
    };
  }

  public get type() {
    return `(${this.struct.map((item) => item.type).join(',')})`;
  }
}
