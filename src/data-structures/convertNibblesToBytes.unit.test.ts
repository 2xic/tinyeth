import { convertNibblesToBytes } from './convertNibblesToBytes';

describe('convertBytesToNibbles', () => {
  it('should correctly encode nibble', () => {
    const encoded = convertNibblesToBytes([6, 8, 6, 5, 6, 12, 6, 12, 6, 15]);
    expect(encoded.toString('ascii')).toBe('hello');
  });
});
