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

    const referenceSize = 32;

    const mappedStruct = this.struct.map((item, index) => {
      if (item.isDynamic) {
        const value = item.value.encoding;
        parameterIndex[index] = value;

        itemIndex += referenceSize;
        return index;
      }

      itemIndex += getBufferFromHex(item.value.encoding).length;
      return item.value.encoding;
    });

    this.setReferenceValue({
      parameterIndex,
      mappedStruct,
      itemIndex,
    });

    return {
      encoding: mappedStruct.join(''),
    };
  }

  private setReferenceValue({
    parameterIndex,
    mappedStruct,
    itemIndex,
  }: {
    parameterIndex: Record<number, string>;
    mappedStruct: Array<number | string>;
    itemIndex: number;
  }) {
    [...mappedStruct].forEach((item) => {
      if (typeof item == 'number') {
        const value = parameterIndex[item];
        mappedStruct[item] = convertNumberToPadHex(itemIndex).padStart(64, '0');
        itemIndex += getBufferFromHex(parameterIndex[item]).length;

        mappedStruct.push(value);
      }
    });
  }

  public get type() {
    return `(${this.struct.map((item) => item.type).join(',')})`;
  }

  public get encoding() {
    return this.value.encoding;
  }
}
