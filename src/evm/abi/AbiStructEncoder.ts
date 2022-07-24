import { Uint } from '../../rlp/types/Uint';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { AbiAddressType } from './AbiAddressType';
import { AbiArrayType } from './AbiArrayType';
import { AbiStringType } from './AbiStringType';

export class AbiStructEncoder {
  constructor(
    public struct: Array<Uint | AbiArrayType | AbiStringType | AbiAddressType>
  ) {}

  public get value() {
    const parameterIndex: Record<number, string> = {};
    let itemIndex = 0;

    const mappedStruct = this.struct.map((item, index) => {
      if (item.isDynamic) {
        const value = item.value.encoding;
        parameterIndex[index] = value;
        // This will just be reference of 32 bits.
        itemIndex += 32;
        return index;
      }
      itemIndex += getBufferFromHex(item.value.encoding).length;
      return item.value.encoding;
    });

    // TODO : clean up this.
    for (const item of [...mappedStruct]) {
      if (typeof item == 'number') {
        const value = parameterIndex[item];
        mappedStruct[item] = convertNumberToPadHex(itemIndex).padStart(64, '0');
        itemIndex += getBufferFromHex(parameterIndex[item]).length;

        mappedStruct.push(value);
      }
    }

    return {
      encoding: mappedStruct.join(''),
    };
  }

  public get type() {
    return `(${this.struct.map((item) => item.type).join(',')})`;
  }

  public get encoding() {
    return this.value.encoding;
  }
}
