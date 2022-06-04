import { getBufferFromHex } from './getBufferFromHex';

describe('getBufferFromHex', () => {
  it('should correctly convert a hex string to buffer', () => {
    const buffer = getBufferFromHex('\x00\x00\x00\x00');
    expect(buffer).toHaveLength(4);
  });
});
