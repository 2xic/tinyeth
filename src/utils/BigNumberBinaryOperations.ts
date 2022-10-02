import BigNumber from 'bignumber.js';

export class BigNumberBinaryOperations {
  constructor(private value: BigNumber) {}

  public and(other: BigNumberBinaryOperations) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.value);

    const results = a & b;

    return this.convertBack(results);
  }

  public xor(other: BigNumberBinaryOperations) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.value);

    const results = a ^ b;

    return this.convertBack(results);
  }

  public or(other: BigNumberBinaryOperations) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.value);

    const results = a | b;

    return this.convertBack(results);
  }

  private convertToBigInt(value: BigNumber) {
    if (value.isNaN()) {
      throw new Error('Input was nan');
    }
    const bigInt = BigInt(value.toString());

    return bigInt;
  }

  public convertBack(item: BigInt) {
    return new BigNumber(item.toString());
  }
}
