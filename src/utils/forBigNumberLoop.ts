import BigNumber from 'bignumber.js';

export function forLoop({
  startValue,
  endValue,
  increment = new BigNumber(1),
  callback,
}: {
  startValue: BigNumber;
  endValue: BigNumber;
  increment?: BigNumber;
  callback: (i: BigNumber) => void;
}) {
  let i = new BigNumber(startValue);

  while (i.isLessThan(endValue)) {
    callback(i);

    i = i.plus(increment);
  }
}
