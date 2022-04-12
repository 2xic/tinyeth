export class EvmStack {
  private stack: number[] = [];

  public push(value: number) {
    this.stack.push(value);
  }

  public shift(): number {
    const value = this.stack.shift() || 0;

    return value;
  }

  get(index: number) {
    return this.stack[index];
  }

  set(index: number, value: number) {
    this.stack[index] = value;
  }

  public get length() {
    return this.stack.length;
  }

  public toString() {
    return this.stack.toString();
  }
}
