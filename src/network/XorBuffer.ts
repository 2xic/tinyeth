export function xor(buf1: Buffer, buf2: Buffer): Buffer {
  const bufResult: Buffer = Buffer.from(buf1.map((b, i) => b ^ buf2[i]));
  return bufResult;
}
