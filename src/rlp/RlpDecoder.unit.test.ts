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
    ).toBe('128');
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
});
