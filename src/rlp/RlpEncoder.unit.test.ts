import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { sha3_256 } from '../utils/sha3_256';
import { RlpEncoder } from './RlpEncoder';

describe('RlpEncoder', () => {
  const interactor = new RlpEncoder();

  it('should correctly encode booleans', () => {
    expect(
      interactor.encode({
        input: true,
      })
    ).toBe('0x01');

    expect(
      interactor.encode({
        input: false,
      })
    ).toBe('0x80');
  });

  it('should correctly encode falsy values', () => {
    expect(
      interactor.encode({
        input: [],
      })
    ).toBe('0xc0');

    expect(
      interactor.encode({
        input: '',
      })
    ).toBe('0x80');

    expect(
      interactor.encode({
        input: 0,
      })
    ).toBe('0x80');
  });

  it('should correctly encode numbers', () => {
    expect(
      interactor.encode({
        input: 127,
      })
    ).toBe('0x7f');

    expect(
      interactor.encode({
        input: 128,
      })
    ).toBe('0x8180');

    expect(
      interactor.encode({
        input: 256,
      })
    ).toBe('0x820100');

    expect(
      interactor.encode({
        input: 1024,
      })
    ).toBe('0x820400');

    expect(
      interactor.encode({
        input: 0xffffff,
      })
    ).toBe('0x83ffffff');

    expect(
      interactor.encode({
        input: 0xffffffff,
      })
    ).toBe('0x84ffffffff');

    expect(
      interactor.encode({
        input: 0xffffffff,
      })
    ).toBe('0x84ffffffff');

    expect(
      interactor.encode({
        input: new BigNumber('0xFFFFFFFFFFFFFF'),
      })
    ).toBe('0x87ffffffffffffff');
  });

  it('should correctly encoded strings', () => {
    expect(
      interactor.encode({
        input: 'dog',
      })
    ).toBe('0x83646f67');

    expect(
      interactor.encode({
        input: 'hello world',
      })
    ).toBe('0x8b68656c6c6f20776f726c64');

    expect(
      interactor.encode({
        input: 'Lorem ipsum dolor sit amet, consectetur adipisicing eli',
      })
    ).toBe(
      '0xB74C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C69'.toLowerCase()
    );

    expect(
      interactor.encode({
        input: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
      })
    ).toBe(
      '0xB8384C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C6974'.toLowerCase()
    );
  });

  it('should correctly encode a list of words', () => {
    expect(
      interactor.encode({
        input: ['hello', 'world'],
      })
    ).toBe('0xcc8568656c6c6f85776f726c64');

    expect(
      interactor.encode({
        input: ['cat', 'dog'],
      })
    ).toBe('0xc88363617483646f67');
  });

  it('should correctly encode a long list', () => {
    const aEncoded = [...new Array(1024)].map(() => '61').join('');
    expect(
      interactor.encode({
        input: [...new Array(1024)].map(() => 'a').join(''),
      })
    ).toBe('0xb90400' + aEncoded);

    expect(
      interactor.encode({
        input: [
          'aaa',
          'bbb',
          'ccc',
          'ddd',
          'eee',
          'fff',
          'ggg',
          'hhh',
          'iii',
          'jjj',
          'kkk',
          'lll',
          'mmm',
          'nnn',
          'ooo',
        ],
      })
    ).toBe(
      '0xF83C836161618362626283636363836464648365656583666666836767678368686883696969836A6A6A836B6B6B836C6C6C836D6D6D836E6E6E836F6F6F'.toLowerCase()
    );
  });

  it('should correctly encode a byte array', () => {
    expect(
      interactor.encode({
        input: new Uint8Array([0x80]),
      })
    ).toBe('0x8180');

    expect(
      interactor.encode({
        input: new Uint8Array([0xff]),
      })
    ).toBe('0x81ff');

    expect(
      interactor.encode({
        input: new Uint8Array([1, 2, 3]),
      })
    ).toBe('0x83010203');

    expect(
      interactor.encode({
        input: '1',
      })
    ).toBe('0x31');
  });

  it('should correctly encode a array inside a array', () => {
    expect(
      interactor.encode({
        input: [[], [[]], [[], [[]]]],
      })
    ).toBe('0xC7C0C1C0C3C0C1C0'.toLowerCase());
  });

  it('should correctly encode numbers inside a array', () => {
    expect(
      interactor.encode({
        input: [1, 2, 3],
      })
    ).toBe('0xC3010203'.toLowerCase());
  });

  it('should correctly encode mix of buffers and string', () => {
    const input = [
      '',
      '',
      '',
      '',
      '',
      [
        Buffer.from('35', 'hex'),
        Buffer.concat([
          Buffer.from('cb8a', 'hex'),
          Buffer.from('hellothere', 'ascii'),
        ]),
      ],
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      Buffer.concat([
        Buffer.from('c685', 'hex'),
        Buffer.from('hello', 'ascii'),
      ]),
    ];
    expect(
      interactor.encode({
        input,
      })
    ).toBe(
      '0xe68080808080ce358ccb8a68656C6C6F74686572658080808080808080808087c68568656C6C6F'.toLowerCase()
    );
  });

  it('should correctly encode a specific list', () => {
    const encoded = interactor.encode({
      input: [
        Buffer.from('00010102', 'hex'),
        Buffer.from(
          'dc6e2b9778d3bec8fcd3764f8fed3b66ca0b46f4b97c907239efc9fc0e13ca3a',
          'hex'
        ),
      ],
    });
    expect(encoded).toBe(
      '0xe68400010102a0dc6e2b9778d3bec8fcd3764f8fed3b66ca0b46f4b97c907239efc9fc0e13ca3a'
    );
    expect(sha3_256(getBufferFromHex(encoded)).toString('hex')).toBe(
      'b47e5f20cadaf505f1fe660a45def89d80eb04213549f6bb04f57d6c2e8fc479'
    );
  });

  it('should correctly encode a spesific list', () => {
    const encoded = interactor.encode({
      input: [
        Buffer.from('0001', 'hex'),
        [
          [Buffer.from('320304', 'hex'), '2'],
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '1',
        ],
      ],
    });
    expect(encoded).toBe(
      '0xda820001d6c5833203043280808080808080808080808080808031'
    );
  });

  it('should correctly encode a user agent', () => {
    const encoding = new RlpEncoder().encode({
      input: ['Geth/v1.10.17-stable-25c9b49f/linux-amd64/go1.18'],
    });
    expect(encoding.slice(2)).toBe(
      'f1b0476574682f76312e31302e31372d737461626c652d32356339623439662f6c696e75782d616d6436342f676f312e3138'
    );
  });

  it('should encode a 2d array', () => {
    const encoding = new RlpEncoder().encode({
      input: [
        ['eth', 66],
        ['snap', 1],
      ],
    });
    expect(encoding.slice(2)).toBe('cdc58365746842c684736e617001');
  });

  it('should encode a large array', () => {
    const encoding2 = new RlpEncoder().encode({
      input: ['a'.repeat(128)],
    });
    expect(encoding2.slice(2)).toBe(
      'f882b8806161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161'
    );
  });
});
