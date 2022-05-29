import crypto from 'crypto';

export function createAes256CtrDecipher({ key }: { key: Buffer }) {
  const iv = Buffer.alloc(16);
  return crypto.createDecipheriv('aes-256-ctr', key, iv);
}
