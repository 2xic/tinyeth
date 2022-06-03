import crypto from 'crypto';

export function createAes256CtrDecipher({
  key,
  iv = Buffer.alloc(16),
}: {
  key: Buffer;
  iv?: Buffer;
}) {
  return crypto.createDecipheriv('aes-256-ctr', key, iv);
}
