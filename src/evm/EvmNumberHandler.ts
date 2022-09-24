import BigNumber from 'bignumber.js';
import { SignedUnsignedNumberConverter } from './SignedUnsignedNumberConverter';

export class EvmNumberHandler {
  constructor(private value: BigNumber) {}

  public and(other: EvmNumberHandler) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.raw);

    const results = a & b;

    return this.convertBack(results);
  }

  public xor(other: EvmNumberHandler) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.raw);

    const results = a ^ b;

    return this.convertBack(results);
  }

  public or(other: EvmNumberHandler) {
    const a = this.convertToBigInt(this.value);
    const b = this.convertToBigInt(other.raw);

    const results = a | b;

    return this.convertBack(results);
  }

  public divideFloor(other: EvmNumberHandler): BigNumber {
    return this.raw.dividedBy(other.raw).integerValue(BigNumber.ROUND_FLOOR);
  }

  private convertBack(value: BigInt) {
    return new SignedUnsignedNumberConverter().convert(
      new BigNumber(value.toString())
    );
  }

  private convertToBigInt(value: BigNumber) {
    const converted = new SignedUnsignedNumberConverter().parse(value);
    const bigInt = BigInt(converted.toString());

    return bigInt;
  }

  public get raw() {
    return this.value;
  }
}
