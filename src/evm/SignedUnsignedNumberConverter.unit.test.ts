import BigNumber from 'bignumber.js';
import { SignedUnsignedNumberConverter } from './SignedUnsignedNumberConverter';

describe('SignedUnsignedNumberConverter', () => {
  it('should correctly parse an uint', () => {
    // example from https://ethereum.stackexchange.com/a/21205
    const value = new SignedUnsignedNumberConverter().parse(
      '00000000000000000000000000000000000000000000000000000000075bcd15'
    );
    expect(value.toNumber()).toBe(123456789);
  });

  it('should correctly parse an negative int', () => {
    // example from https://ethereum.stackexchange.com/a/21205
    const value = new SignedUnsignedNumberConverter().parse(
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffff8a432eb'
    );
    expect(value.toNumber()).toBe(-123456789);
  });

  it('should correctly parse an int', () => {
    // example from https://ethereum.stackexchange.com/a/21205
    const value = new SignedUnsignedNumberConverter().parse(
      '00000000000000000000000000000000000000000000000000000000075bcd15'
    );
    expect(value.toNumber()).toBe(123456789);
  });
});
