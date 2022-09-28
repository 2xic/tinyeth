import BigNumber from 'bignumber.js';

export function getBigNumberFromBuffer(value: Buffer): BigNumber {
  return new BigNumber(value.toString('hex'), 16);
}
