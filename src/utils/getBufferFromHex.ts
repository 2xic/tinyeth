export function getBufferFromHex(inputHash: string | Buffer): Buffer {
  if (typeof inputHash === 'string') {
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