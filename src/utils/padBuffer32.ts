import { roundToClosest32 } from './roundToClosest32';

export function padBuffer32({ input }: { input: Buffer }) {
  const newBuffer = Buffer.concat([
    input,
    Buffer.alloc(roundToClosest32(input.length)),
  ]);
  return newBuffer;
}
