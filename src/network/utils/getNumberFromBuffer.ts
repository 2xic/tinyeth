export function getNumberFromBuffer(input: Buffer) {
  const length = input.length;
  if (length === 0) {
    return 0;
  }
  return input.readIntBE(0, length);
}
