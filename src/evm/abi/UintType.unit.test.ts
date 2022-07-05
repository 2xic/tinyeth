import { UintType } from './UintType';

describe('UintType', () => {
  it('should correctly encode a uint16', () => {
    const output = new UintType('1110', 16).value.encoding;
    expect(output).toBe(
      '0000000000000000000000000000000000000000000000000000000000000456'
    );
  });
});
