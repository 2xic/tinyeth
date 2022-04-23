export function singleHexDigitString(buffer: Buffer) {
  let output = '';
  for (const i of buffer) {
    if (16 < i) {
      throw new Error('Number to big');
    }
    output += i.toString(16);
  }
  return output;
}
