import BigNumber from 'bignumber.js';
import { cleanString } from '../utils';
import { RlpDecoder } from './RlpDecoder';

describe('RlpDecoder', () => {
  it('it should decode non values', () => {
    expect(
      new RlpDecoder().decode({
        input: '0x80',
      })
    ).toBe('');
  });

  it('should correctly decode a string', () => {
    const decoded = new RlpDecoder().decode({
      input: '0x8b68656c6c6f20776f726c64',
    });
    expect(decoded).toBe('hello world');

    expect(
      new RlpDecoder().decode({
        input:
          '0xB74C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C69',
      })
    ).toBe('Lorem ipsum dolor sit amet, consectetur adipisicing eli');
  });

  it('should decode numbers', () => {
    expect(
      new RlpDecoder().decode({
        input: '0x05',
      })
    ).toBe('5');

    expect(
      new RlpDecoder().decode({
        input: '0x8180',
      })
    ).toBe('0x80');
  });

  it('should correctly decode a list', () => {
    expect(
      new RlpDecoder().decode({
        input: '0xC50102030405',
      })
    ).toBe(JSON.stringify([1, 2, 3, 4, 5]));

    expect(
      new RlpDecoder().decode({
        input: '0xcc8568656c6c6f85776f726c64',
      })
    ).toBe(JSON.stringify(['hello', 'world']));
  });

  it('should correctly decode a bigint', () => {
    expect(
      new RlpDecoder().decode({
        input: '0x87ffffffffffffff',
      })
    ).toBe('0xffffffffffffff');
  });

  it('should correctly decode a bigint', () => {
    expect(
      new RlpDecoder().decode({
        input: '0x87ffffffffffffff',
      })
    ).toBe('0xffffffffffffff');
  });

  it('should correctly decode a number in list', () => {
    expect(
      new RlpDecoder().decode({
        input: '0xc382270f',
      })
    ).toBe(JSON.stringify(['0x270f']));
  });

  it('should be able to decode a packet', () => {
    const input = cleanString(`
    f87137916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270fb840
    fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569
    bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877c883666f6f836261720304    
     `);

    expect(
      new RlpDecoder().decode({
        input,
      })
    ).toBe(
      JSON.stringify([
        '0x37',
        '0x6b6e6574682f76302e39312f706c616e39',
        [
          ['0x657468', '0x3d'],
          ['0x6d6f726b', '0x16'],
        ],
        '0x270f',
        '0xfda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877',
        ['0x666f6f', '0x626172'],
        '0x03',
        '0x04',
      ])
    );
  });
});
