export function createFixedSizeBuffer(value: Buffer, size: number) {
  if (size < value.length) {
    return Buffer.concat([value, Buffer.alloc(size - value.length)]);
  }
  return value;
}
