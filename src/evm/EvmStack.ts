export class EvmStack {
  private stack: number[] = [];

  public push(value: number) {
    this.stack.push(value);
  }

  public pop(): number {
    const value = this.stack.pop() || 0;

    return value;
  }

  get(index: number) {
    if (index < 0) {
      return this.stack[this.stack.length - Math.abs(index)];
    } else {
      return this.stack[index];
    }
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
