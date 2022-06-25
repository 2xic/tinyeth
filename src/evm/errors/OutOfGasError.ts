export class OutOfGasError extends Error {
  constructor() {
    super('Out of gas');
  }
}
