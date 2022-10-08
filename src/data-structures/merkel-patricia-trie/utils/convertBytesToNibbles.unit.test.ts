import { convertBytesToNibbles } from './convertBytesToNibbles';
import { describe, it, expect } from '../../../getActiveTestMetadata';

describe('convertBytesToNibbles', () => {
  it('should correctly encode nibble', () => {
    const encoded = convertBytesToNibbles(Buffer.from('hello'));
    expect([...encoded]).toMatchObject([6, 8, 6, 5, 6, 12, 6, 12, 6, 15]);
  });

  it('should correctly encode nibble from ethwiki', () => {
    const encoded = convertBytesToNibbles(Buffer.from('do'));
    expect([...encoded]).toMatchObject([0x6, 0x4, 0x6, 0xf]);
  });
});
