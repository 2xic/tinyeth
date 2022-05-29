export function convertNumberToPadHex(number: number | string) {
  const convertedNumber = (
    typeof number === 'string' ? parseInt(number) : number
  ).toString(16);

  return convertedNumber.length % 2 == 0
    ? convertedNumber
    : `0${convertedNumber}`;
}
