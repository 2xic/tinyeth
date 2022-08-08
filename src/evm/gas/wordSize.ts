import BigNumber from 'bignumber.js';

export function wordSize({ address }: { address: BigNumber }) {
  return address.plus(31).dividedBy(32).decimalPlaces(0, BigNumber.ROUND_FLOOR);
}
