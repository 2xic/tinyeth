export const TERMINATOR_SYMBOL = 16;

export function addTerminator(input: Buffer): Buffer {
  if (input[input.length - 1] == TERMINATOR_SYMBOL) {
    return input;
  }
  return Buffer.concat([Buffer.from(input), Buffer.from([TERMINATOR_SYMBOL])]);
}

export function removeTerminator(input: Buffer): Buffer {
  if (input[input.length - 1] === TERMINATOR_SYMBOL) {
    return input.slice(0, input.length - 1);
  }
  return input;
}
