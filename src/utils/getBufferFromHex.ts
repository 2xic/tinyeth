export function getBufferFromHex(inputHash: string | Buffer): Buffer {
  if (
    inputHash ===
    '\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
  ) {
    return Buffer.alloc(32);
  }

  if (typeof inputHash === 'string') {
    const isEscaped = JSON.stringify(inputHash).includes('\\u');
    if (isEscaped) {
      return Buffer.from(inputHash);
    }
    const hash = inputHash.startsWith('0x')
      ? `${inputHash.slice(2)}`
      : inputHash;

    if (hash.length == 1) {
      return Buffer.from([parseInt(hash, 16)]);
    }

    return Buffer.from(hash, 'hex');
  }
  return inputHash;
}
