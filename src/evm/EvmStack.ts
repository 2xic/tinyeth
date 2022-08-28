import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { StackUnderflow } from './errors/StackUnderflow';

@injectable()
export class EvmStack {
  private stack: BigNumber[] = [];

  public push(value: BigNumber) {
    this.stack.push(value);
  }

  public pop(): BigNumber {
    const value = this.stack.pop();
    if (!value) {
      throw new StackUnderflow();
    }

    return value;
  }

  get(index: number) {
    if (index < 0) {
      return this.stack[this.stack.length - Math.abs(index)];
    } else {
      return this.stack[index];
    }
  }

  set(index: number, value: BigNumber) {
    this.stack[index] = value;
  }

  public get length() {
    return this.stack.length;
  }

  public get raw() {
    return this.stack;
  }

  public toString() {
    return this.stack.toString();
  }

  public swap(from: number, to: number) {
    const delta = this.length - 1;
    const fromItem = this.stack[delta - from];
    const toItem = this.stack[delta - to];

    this.stack[delta - to] = fromItem;
    this.stack[delta - from] = toItem;
  }
}
