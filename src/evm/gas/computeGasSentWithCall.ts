import BigNumber from 'bignumber.js';

export function computeGasSentWithCall({
  requestedGas,
  availableGas,
  baseGas,
}: {
  requestedGas: BigNumber;
  availableGas: number;
  baseGas: number;
}) {
  const remainingGas = availableGas - baseGas; // 700;
  const allButOneOf64 = remainingGas - Math.floor(remainingGas / 64);
  const gasSentWithCall = Math.min(requestedGas.toNumber(), allButOneOf64);

  return gasSentWithCall;
}
