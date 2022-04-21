export function packNibbles(input: Buffer): Buffer {
  const output: string[] = [];
  let flag = 0;

  if (input[input.length - 1] == 16) {
    input = input.slice(0, input.length - 1);
    flag = 2;
  }
  const length = input.length % 2;
  //  flag |= length;

  if (length) {
    input = Buffer.concat([Buffer.from([flag]), input]);
  } else {
    input = Buffer.concat([Buffer.from([flag, 0]), input]);
  }

  for (let i = 0; i < input.length; i += 2) {
    output.push(String.fromCharCode(16 * input[i] + input[i + 1]));
  }
  return Buffer.from(output.join(''), 'ascii');
}
