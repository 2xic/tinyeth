export function assertBufferFirstItemValue(buffer: Buffer, value: number) {
  if (buffer[0] !== value) {
    throw new Error(`Bad value, ${buffer[0]} != ${value}`);
  }
}

export function assertEqual<T>(buffer: T, value: T) {
  if (buffer !== value) {
    throw new Error(`Bad value, ${buffer} != ${value}`);
  }
}
