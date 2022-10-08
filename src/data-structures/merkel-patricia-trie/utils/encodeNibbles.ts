/*
    Appendix c
        HP function in the yellow paper
        equation 198, and 199.
*/
export function encodeNibbles({
  inputBytes,
  isLeaf,
}: {
  inputBytes: Readonly<Buffer>;
  isLeaf: boolean;
}): Buffer {
  let flag = getFlag(inputBytes);
  let bytes = inputBytes;
  flag += isLeaf ? 0x20 : 0;

  if (isOddLength(bytes)) {
    bytes = Buffer.concat([Buffer.from([flag]), inputBytes]);
  } else {
    bytes = Buffer.concat([Buffer.from([0, flag]), inputBytes]);
  }

  let output = '';
  for (let i = 0; i < bytes.length; i += 2) {
    output += String.fromCharCode(16 * bytes[i] + bytes[i + 1]);
  }
  return Buffer.from(output, 'ascii');
}

function getFlag(bytes: Buffer) {
  return 0 | isOddLength(bytes);
}

function isOddLength(bytes: Buffer) {
  return bytes.length % 2;
}
