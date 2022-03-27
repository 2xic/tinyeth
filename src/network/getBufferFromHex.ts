export function getBufferFromHash(hash: string): Buffer {
  return Buffer.from(hash, 'hex');
}
