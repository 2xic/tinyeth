export class InvalidJump extends Error {
  constructor(message = 'Invalid jump location') {
    super(message);
  }
}
