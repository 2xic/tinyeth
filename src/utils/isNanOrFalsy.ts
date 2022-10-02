import BigNumber from 'bignumber.js';

export function isNanOrFalsy(value?: number | BigNumber) {
  const isBigNumberNaN = BigNumber.isBigNumber(value) ? value.isNaN() : false;
  const isNUmberNan = typeof value === 'number' ? Number.isNaN(value) : false;

  if (value === undefined || isNUmberNan || isBigNumberNaN) {
    return true;
  }

  return false;
}
