export class Reverted extends Error {
  constructor(reason: string) {
    super(`Reverted: ${reason}`);
    Object.setPrototypeOf(this, Reverted.prototype);
  }
}
