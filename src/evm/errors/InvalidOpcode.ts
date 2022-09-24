export class InvalidOpcode extends Error {
  constructor() {
    super('Ran invalid opcode');
    Object.setPrototypeOf(this, InvalidOpcode.prototype);
  }
}
