export function assertBufferFirstItemValue(
  expected: Buffer,
  receivedValue: number
) {
  if (expected[0] !== receivedValue) {
    throw new Error(`Bad value, ${expected[0]} != ${receivedValue}`);
  }
}

export function assertEqual<T>(
  expected: T,
  receivedValue: T,
  message?: string
) {
  if (expected !== receivedValue) {
    if (message) {
      throw new Error(
        `${message} -  values : (${expected} != ${receivedValue})`
      );
    } else {
      throw new Error(`Bad value, ${expected} != ${receivedValue}`);
    }
  }
}
