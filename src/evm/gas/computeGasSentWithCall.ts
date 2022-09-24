import BigNumber from 'bignumber.js';

export function computeGasSentWithCall({
  gas2Send,
  usedGas,
}: {
  gas2Send: BigNumber;
  usedGas: number;
}) {
  const remainingGas = usedGas - 700;
  const allBut64 = remainingGas - Math.floor(remainingGas / 64);
  const gasSentWithCall = Math.min(gas2Send.toNumber(), allBut64);

  return gasSentWithCall;
}
