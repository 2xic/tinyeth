import fc from 'fast-check';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
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
      input: getBufferFromHex(encodedString.encoding),
      fromIndex: 0,
    });
    expect(decodedString.decoding).toBe(input);
    // it uses two bytes to decode, one for the length of the length, and the actual length.
    expect(decodedString.newIndex).toBe(input.length + 2);
  });

  it('should correctly decode a number as string', () => {
    const encodedString = interactor.encode({
      input: '1',
    }).encoding;
    expect(encodedString).toBe('31');
  });

  it('should correctly encode a string as buffer and string', () => {
    const encodedString = interactor.encode({
      input: '5',
    });
    const encodedBuffer = interactor.encode({
      input: Buffer.from('5', 'ascii'),
    });
    expect(encodedBuffer.encoding).toBe(encodedString.encoding);
  });

  it('should correctly encode long string', () => {
    const encodedString = interactor.encode({
      input: 'A'.repeat(325),
    });
    expect(encodedString.encoding).toBe(
      'b9014541414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141'
    );
  });

  it('should correctly encode and decode', () => {
    fc.assert(
      fc.property(fc.string(), (a) => {
        if (a.length <= 1) {
          return true;
        }
        const encoder = interactor.encode({ input: a });
        const decode = interactor.decode({
          input: getBufferFromHex(encoder.encoding),
          fromIndex: 0,
        });
        return decode.decoding === a;
      })
    );
  });
});
