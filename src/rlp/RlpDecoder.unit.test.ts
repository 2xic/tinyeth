import { cleanString } from '../utils';
import { RlpDecoder } from './RlpDecoder';

describe('RlpDecoder', () => {
  const interactor = new RlpDecoder();

  it('should correctly decode a string', () => {
    const decoded = interactor.decode({
      input: '0x8b68656c6c6f20776f726c64',
    });
    expect(decoded).toBe('hello world');

    expect(
      interactor.decode({
        input:
          '0xB74C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C69',
      })
    ).toBe('Lorem ipsum dolor sit amet, consectetur adipisicing eli');
  });

  it('should decode numbers', () => {
    expect(
      interactor.decode({
        input: '0x05',
      })
    ).toBe(5);

    expect(
      interactor.decode({
        input: '0x8180',
      })
    ).toBe('0x80');
  });

  it('should correctly decode a list', () => {
    expect(
      interactor.decode({
        input: '0xC50102030405',
      })
    ).toMatchObject([1, 2, 3, 4, 5]);

    expect(
      interactor.decode({
        input: '0xcc8568656c6c6f85776f726c64',
      })
    ).toMatchObject(['hello', 'world']);
  });

  it('should correctly decode a bigint', () => {
    expect(
      interactor.decode({
        input: '0x87ffffffffffffff',
      })
    ).toBe('0xffffffffffffff');
  });

  it('should correctly decode a bigint', () => {
    expect(
      interactor.decode({
        input: '0x87ffffffffffffff',
      })
    ).toBe('0xffffffffffffff');
  });

  it('should correctly decode a number in list', () => {
    expect(
      interactor.decode({
        input: '0xc382270f',
      })
    ).toMatchObject(['0x270f']);
  });

  it('should correctly decode falsy values', () => {
    expect(
      interactor.decode({
        input: '0xc0',
      })
    ).toMatchObject([]);
  });

  it('should correctly decode a array inside a array', () => {
    expect(
      interactor.decode({
        input: '0xC7C0C1C0C3C0C1C0'.toLowerCase(),
      })
    ).toMatchObject([[], [[]], [[], [[]]]]);
  });

  it('should correctly decode numbers inside a array', () => {
    expect(
      interactor.decode({
        input: '0xC3010203'.toLowerCase(),
      })
    ).toMatchObject([1, 2, 3]);
  });

  it('should be able to decode subarray', () => {
    expect(
      interactor.decode({
        input: '0xcdc5836574683dc6846d6f726b16',
      })
    ).toMatchObject([
      ['eth', 61],
      ['mork', 22],
    ]);

    expect(
      interactor.decode({
        input: '0xc9c883666f6f83626172',
      })
    ).toMatchObject([['foo', 'bar']]);
  });

  it('should be able to decode large number', () => {
    expect(
      interactor.decode({
        input: '0x88FFFFFFFFFFFFFFFF',
      })
    ).toBe('0xFFFFFFFFFFFFFFFF'.toLowerCase());
  });

  it('should correctly decode a byte array', () => {
    expect(
      interactor.decode({
        input: '0x8180',
      })
    ).toBe('0x80');

    expect(
      interactor.decode({
        input: '0x83010203',
      })
    ).toBe('0x010203');
  });

  it('should correctly decode array with numbers', () => {
    expect(
      interactor.decode({
        input: '0xc482270f03',
      })
    ).toMatchObject(['0x270f', 0x03]);
  });

  it('should correctly decode a byte array', () => {
    expect(
      interactor.decode({
        input:
          '0xe437916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270f',
      })
    ).toMatchObject([
      55,
      'kneth/v0.91/plan9',
      [
        ['eth', 61],
        ['mork', 22],
      ],
      '0x270f',
    ]);

    expect(
      interactor.decode({
        input:
          '0xe537916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270f03',
      })
    ).toMatchObject([
      55,
      'kneth/v0.91/plan9',
      [
        ['eth', 61],
        ['mork', 22],
      ],
      '0x270f',
      0x03,
    ]);
  });

  it('should correctly split list', () => {
    expect(
      interactor.decode({
        input:
          '0xF83C836161618362626283636363836464648365656583666666836767678368686883696969836A6A6A836B6B6B836C6C6C836D6D6D836E6E6E836F6F6F',
      })
    ).toMatchObject([
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
    ]);
  });

  it('should correctly encode booleans', () => {
    expect(
      interactor.decode({
        input: '0x01',
      })
    ).toBe(1);

    expect(
      interactor.decode({
        input: '0x80',
      })
    ).toBe(false);
  });

  it('should correctly decode subset', () => {
    const input = cleanString(`
      0xf237916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270f82270fc883666f6f836261720304
       `);

    expect(
      interactor.decode({
        input,
      })
    ).toMatchObject([
      55,
      'kneth/v0.91/plan9',
      [
        ['eth', 61],
        ['mork', 22],
      ],
      '0x270f',
      '0x270f',
      ['foo', 'bar'],
      3,
      4,
    ]);
  });

  it('should correctly decode a long string', () => {
    expect(
      interactor.decode({
        input:
          '0xf842b840fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877',
      })
    ).toMatchObject([
      '0xfda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877',
    ]);
  });

  it('should correctly decode a long list', () => {
    expect(
      interactor.decode({
        input:
          '0xf84490aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa90bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb90cccccccccccccccccccccccccccccccc90dddddddddddddddddddddddddddddddd',
      })
    ).toMatchObject([
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '0xcccccccccccccccccccccccccccccccc',
      '0xdddddddddddddddddddddddddddddddd',
    ]);
  });

  it('should correctly decode list after a list', () => {
    expect(
      interactor.decode({
        input: '0xc882270fc202020304',
      })
    ).toMatchObject(['0x270f', [0x2, 0x2], 0x03, 0x04]);
  });

  it('should correctly decode a long list after a list', () => {
    expect(
      interactor.decode({
        input:
          '0xf86082270fb8564141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141c202020304',
      })
    ).toMatchObject([
      '0x270f',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      [0x02, 0x02],
      0x03,
      0x04,
    ]);
  });

  it('should be able to decode a packet', () => {
    expect(
      interactor.decode({
        input:
          '0xf87137916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270fb840fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877c883666f6f836261720304',
      })
    ).toMatchObject([
      0x37,
      'kneth/v0.91/plan9',
      [
        ['eth', 0x3d],
        ['mork', 22],
      ],
      '0x270f',
      '0xfda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877',
      ['foo', 'bar'],
      0x03,
      0x04,
    ]);
  });

  it('should correctly decode a long list', () => {
    const aEncoded = [...new Array(1024)].map(() => '61').join('');
    expect(
      interactor.decode({
        input: '0xb90400' + aEncoded,
      })
    ).toBe([...new Array(1024)].map(() => 'a').join(''));
  });
});
