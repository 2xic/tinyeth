import { StringEncoderDecoder } from './StringEncoderDecoder';

describe('StringEncoderDecoder', () => {
  it('should correctly decode a short string', () => {
    const input = [...new Array(32)].map(() => 'A').join('');
    const encodedString = new StringEncoderDecoder().encode({
      input,
    });

    const decodedString = new StringEncoderDecoder().decode({
      input: Buffer.from(`${encodedString.encoding}`, 'hex'),
      fromIndex: 0,
    });
    expect(decodedString.decoding).toBe(input);
    expect(decodedString.newIndex).toBe(input.length + 1);
  });

  it('should correctly decode a long string', () => {
    const input = [...new Array(128)].map(() => 'A').join('');
    const encodedString = new StringEncoderDecoder().encode({
      input,
    });

    const decodedString = new StringEncoderDecoder().decode({
      input: Buffer.from(`${encodedString.encoding}`, 'hex'),
      fromIndex: 0,
    });
    expect(decodedString.decoding).toBe(input);
    expect(decodedString.newIndex).toBe(input.length + 1);
  });
});
