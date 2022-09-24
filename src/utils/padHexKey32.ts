import BigNumber from 'bignumber.js';
import { padHex } from './convertNumberToPadHex';

export function padKey32({ key }: { key: BigNumber | number }) {
  let doublePadKey = padHex(key.toString(16));
  doublePadKey = doublePadKey.padStart(66 - doublePadKey.length, '0');
  return doublePadKey;
}
