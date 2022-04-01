export function getBufferFromHash(inputHash: string | Buffer): Buffer {
  if (typeof inputHash === 'string') {
    const hash = inputHash.startsWith('0x')
      ? `${inputHash.slice(2)}`
      : inputHash;

    return Buffer.from(hash, 'hex');
  }
  return inputHash;
}
