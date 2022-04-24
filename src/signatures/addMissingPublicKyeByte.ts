import { getBufferFromHex } from '../network/getBufferFromHex';

export function addMissingPublicKeyByte({ buffer }: { buffer: Buffer }) {
  if (buffer.length === 64) {
    return Buffer.concat([getBufferFromHex('04'), buffer]);
  }
  return buffer;
}
