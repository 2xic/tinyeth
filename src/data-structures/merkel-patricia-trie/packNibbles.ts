import { TERMINATOR_SYMBOL } from './terminatorUtils';

export function packNibbles(input: Buffer): Buffer {
  let flag = 0;

  if (input[input.length - 1] == TERMINATOR_SYMBOL) {
    input = input.slice(0, input.length - 1);
    flag = 2;
  }
  const isOdd = input.length % 2;
  flag |= isOdd;

  if (isOdd) {
    input = Buffer.concat([Buffer.from([flag]), input]);
  } else {
    input = Buffer.concat([Buffer.from([flag, 0]), input]);
  }

  const output: string[] = [];
  for (let i = 0; i < input.length; i += 2) {
    output.push(String.fromCharCode(16 * input[i] + input[i + 1]));
  }
  return Buffer.from(output.join(''), 'ascii');
}
