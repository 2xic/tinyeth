export class Reverted extends Error {
  constructor(reason: string) {
    super(`Reverted: ${reason}`);
  }
}
