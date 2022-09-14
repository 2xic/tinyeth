export function roundToClosest32(value: number) {
  return Math.ceil(value / 32.0) * 32;
}
