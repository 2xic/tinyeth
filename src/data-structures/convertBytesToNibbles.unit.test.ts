import { bytesToNibbles } from './convertBytesToNibbles';

describe('convertBytesToNibbles', () => {
  it('should correctly encode nibble', () => {
    const encoded = bytesToNibbles(Buffer.from('hello'));
    expect(encoded).toMatchObject([6, 8, 6, 5, 6, 12, 6, 12, 6, 15]);
  });
});
