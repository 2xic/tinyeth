// eslint-disable-next-line @typescript-eslint/no-var-requires
const SnappyJS = require('snappyjs');

export function SnappyCompress(input: Buffer): Buffer {
  return SnappyJS.compress(input);
}
