export function getBufferFromHash(hash: string | Buffer): Buffer {
  if (typeof hash === 'string') {
    return Buffer.from(hash, 'hex');
  }
  return hash;
}
