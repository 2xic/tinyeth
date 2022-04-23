import { convertBytesToNibbles } from './convertBytesToNibbles';

export function unpackNibbles(input: Buffer) {
  const output = convertBytesToNibbles(input);
  const flags = output[0];
  if (flags & 2) {
    //   output = Buffer.concat([output, Buffer.from([16])]);
  }

  const isOdd = flags & 1;
  if (isOdd) {
    return output.slice(1);
  } else {
    return output.slice(2);
  }
}
