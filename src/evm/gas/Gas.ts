export const GAS_BASE_COST = 21000;

export function calculateDataGasCost(data: Buffer): number {
  const zeroByteCost = 4;
  const nonZeroByteCost = 16;

  return data
    .map((byte) => (byte === 0 ? zeroByteCost : nonZeroByteCost))
    .reduce((a, b) => a + b, 0);
}
