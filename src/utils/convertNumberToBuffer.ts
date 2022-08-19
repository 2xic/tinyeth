import { convertNumberToPadHex } from './convertNumberToPadHex';
import { getBufferFromHex } from './getBufferFromHex';

export function convertNumberToBuffer(number: number, size = -1) {
  if (size !== -1) {
    const value = getBufferFromHex(convertNumberToPadHex(number));
    if (value.length < size) {
      return Buffer.concat([value, Buffer.alloc(size - value.length)]);
    }
    return value;
  } else {
    return getBufferFromHex(convertNumberToPadHex(number));
  }
}
