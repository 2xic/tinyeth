import BigNumber from 'bignumber.js';

export function getBigNumberFromBoolean(value: boolean) {
  if (value) {
    return new BigNumber(1);
  } else {
    return new BigNumber(0);
  }
}
