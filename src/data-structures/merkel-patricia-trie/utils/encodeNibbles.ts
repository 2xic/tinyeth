/*
    Appendix c
        HP function in the yellow paper
        equation 198, and 199.
*/
export function encodeNibbles(inputBytes: Readonly<Buffer>): string {
  const flag = getFlag(inputBytes);
  let bytes = inputBytes;
  if (isOddLength(bytes)) {
    bytes = Buffer.concat([Buffer.from([flag, 0]), inputBytes]);
  } else {
    bytes = Buffer.concat([Buffer.from([flag]), inputBytes]);
  }
  let output = '';
  for (let i = 0; i < bytes.length; i += 2) {
    output += String.fromCharCode(16 * bytes[i] + bytes[i + 1]);
  }
  return output;
}

function getFlag(bytes: Buffer) {
  return 0 | isOddLength(bytes);
}

function isOddLength(bytes: Buffer) {
  return bytes.length % 2;
}
