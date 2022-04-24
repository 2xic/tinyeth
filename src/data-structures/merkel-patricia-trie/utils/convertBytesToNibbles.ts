export function convertBytesToNibbles(bytes: Buffer): Buffer {
  const results = [];

  for (const number of bytes) {
    const divided = Math.floor(number / 16);
    const remainder = number % 16;
    results.push(divided);
    results.push(remainder);
  }

  return Buffer.from(results);
}
