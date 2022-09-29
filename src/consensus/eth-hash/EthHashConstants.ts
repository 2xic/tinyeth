import BigNumber from 'bignumber.js';

export const WORD_BYTES = new BigNumber('4');
export const DATASET_BYTES_INIT = new BigNumber('2').pow('30');
export const DATASET_BYTES_GROWTH = new BigNumber('2').pow('23');
export const CACHE_BYTES_INIT = new BigNumber('2').pow('24');
export const CACHE_BYTES_GROWTH = new BigNumber('2').pow('17');
export const CACHE_MULTIPLIER = new BigNumber('1024');
export const EPOCH_LENGTH = new BigNumber('30000');
export const MIX_BYTES = new BigNumber('128');
export const HASH_BYTES = new BigNumber('64');
export const DATASET_PARENTS = new BigNumber('256');
export const CACHE_ROUNDS = new BigNumber('3');
export const ACCESSES = new BigNumber('64');
