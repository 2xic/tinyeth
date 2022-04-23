import { StringEncoderDecoder } from './StringEncoderDecoder';

describe('StringEncoderDecoder', () => {
  const interactor = new StringEncoderDecoder();

  it('should correctly decode a short string', () => {
    const input = [...new Array(32)].map(() => 'A').join('');
    const encodedString = interactor.encode({
      input,
    });

    const decodedString = interactor.decode({
      input: Buffer.from(`${encodedString.encoding}`, 'hex'),
      fromIndex: 0,
    });
    expect(decodedString.decoding).toBe(input);
    expect(decodedString.newIndex).toBe(input.length + 1);
  });

  it('should correctly decode a long string', () => {
    const input = [...new Array(128)].map(() => 'A').join('');
    const encodedString = interactor.encode({
      input,
    });

    const decodedString = interactor.decode({
      input: Buffer.from(`${encodedString.encoding}`, 'hex'),
      fromIndex: 0,
    });
    expect(decodedString.decoding).toBe(input);
    // it uses two bytes to decode, one for the length of the length, and the actual length.
    expect(decodedString.newIndex).toBe(input.length + 2);
  });

  // TODO: Fix this, it should not output non deterministic results
  //      it should only output hex, because if not it will mess up buffer.from
  it.skip('should correctly encode a string as buffer and string', () => {
    const encodedString = interactor.encode({
      input: '5',
    });
    const encodedBuffer = interactor.encode({
      input: Buffer.from('5', 'ascii'),
    });
    expect(encodedBuffer.encoding).toBe(encodedString.encoding);
  });
});
