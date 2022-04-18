export function convertNibblesToBytes(input: number[]): Buffer {
  const output: string[] = [];
  for (let i = 0; i < input.length; i += 2) {
    output.push(String.fromCharCode(16 * input[i] + input[i + 1]));
  }
  return Buffer.from(output.join(''), 'ascii');
}
