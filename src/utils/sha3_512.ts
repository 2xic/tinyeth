import { sha3_512 as js_sha3_512 } from 'js-sha3';

export function sha3_512(data: Buffer): Buffer {
  const hashHex = js_sha3_512(data);

  return Buffer.from(hashHex, 'hex');
}
