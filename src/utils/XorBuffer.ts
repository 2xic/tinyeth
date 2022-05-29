export function xor(buf1: Buffer, buf2: Buffer): Buffer {
  if (buf1.length !== buf2.length) {
    throw new Error('Should have equal length');
  }
  const results: number[] = [...new Array(buf1.length)].map(
    (_, index) => buf1[index] ^ buf2[index]
  );

  return Buffer.from(results);
}
