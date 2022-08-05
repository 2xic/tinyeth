export class UndeclaredVariableError extends Error {
  constructor(variables: string) {
    super(`Undeclared variable ${variables}`);
  }
}
