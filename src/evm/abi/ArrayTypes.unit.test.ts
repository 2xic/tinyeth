import { ArrayType } from './ArrayType';
import { UintType } from './UintType';

describe('ArrayType', () => {
  it('should correctly encode a empty array', () => {
    const output = new ArrayType([]).value.encoding;
    expect(output).toBe(
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly encode an array with 0 item', () => {
    const output = new ArrayType([new UintType('0', 16)]).value.encoding;
    expect(output).toBe(
      '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly encode a uint16[]', () => {
    const output = new ArrayType([
      new UintType('1110', 16),
      new UintType('1110', 16),
    ]).value.encoding;
    expect(output).toBe(
      '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000456'
    );
  });

  it('should correctly encode a uint16[]', () => {
    const output = new ArrayType([
      new UintType('1110', 16),
      new UintType('1110', 16),
      new UintType('1110', 16),
    ]).value.encoding;
    expect(output).toBe(
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000045600000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000456'
    );
  });

  it('should correctly encode a uint16[]', () => {
    const output = new ArrayType([
      new UintType('1110', 16),
      new UintType('1110', 16),
      new UintType('1110', 16),
      new UintType('1110', 16),
    ]).value.encoding;
    expect(output).toBe(
      '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000456000000000000000000000000000000000000000000000000000000000000045600000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000456'
    );
  });

  it('should correctly encode a uint32[]', () => {
    const output = new ArrayType([
      new UintType('1110', 32),
      new UintType('1929', 32),
    ]).value.encoding;
    expect(output).toBe(
      '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789'
    );
  });

  it('should correctly encode a uint64[]', () => {
    const output = new ArrayType([
      new UintType('1110', 16),
      new UintType('1110', 16),
      new UintType('1110', 16),
      new UintType('1110', 16),
    ]).value.encoding;
    expect(output).toBe(
      '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000456000000000000000000000000000000000000000000000000000000000000045600000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000456'
    );
  });
});