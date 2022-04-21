export function addTerminator(input: Buffer): Buffer {
  const terminator = 16;
  if (input[input.length - 1] == terminator) {
    return input;
  }
  return Buffer.concat([Buffer.from(input), Buffer.from([terminator])]);
}
