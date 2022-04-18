export function bytesToNibbles(bytes: Buffer): number[] {
  const results = [];
  for (const byte of bytes.toString('ascii')) {
    const number = byte.charCodeAt(0);
    const divided = Math.floor(number / 16);
    const remainder = number % 16;
    results.push(divided);
    results.push(remainder);
  }
  return results;
}
