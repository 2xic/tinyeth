import BigNumber from 'bignumber.js';

export function getBigNumberFromBuffer(value: Buffer): BigNumber {
  if (!Buffer.isBuffer(value)) {
    throw new Error('Input is not a buffer');
  }
  return new BigNumber(value.toString('hex'), 16);
}
