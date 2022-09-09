export function convertNumberToPadHex(number: number | string) {
  const convertedNumber = (
    typeof number === 'string' ? parseInt(number) : number
  ).toString(16);

  return padHex(convertedNumber);
}

export function padHex(input: string) {
  return input.length % 2 == 0 ? input : `0${input}`;
}
