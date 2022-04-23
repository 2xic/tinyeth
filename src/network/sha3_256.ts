import { sha3_256 as js_sha3_256 } from 'js-sha3';

export function sha3_256(data: Buffer): Buffer {
  const hashHex = js_sha3_256(data);

  return Buffer.from(hashHex, 'hex');
}
