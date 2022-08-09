import { Abi } from './Abi';
import { AbiAddressType } from './AbiAddressType';
import { AbiArrayType } from './AbiArrayType';
import { AbiStringType } from './AbiStringType';
import { AbiStructDecoder } from './AbiStructDecoder';
import { AbiStructEncoder } from './AbiStructEncoder';
import { AbiUintType } from './AbiUintType';

describe('AbiDecoder', () => {
  const getBuffer = (item: unknown) => {
    return Buffer.isBuffer(item) ? item : null;
  };
  const getArray = (item: unknown) => {
    return Array.isArray(item) ? item : null;
  };

  it('should correctly decode an empty array', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([new AbiArrayType([])]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['ARRAY'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(Array.isArray(decodedArguments[0])).toBe(true);
    expect(decodedArguments[0]).toHaveLength(0);
  });

  it('should correctly decode multiple empty array', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiArrayType([]),
        new AbiArrayType([]),
        new AbiArrayType([]),
      ]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['ARRAY', 'ARRAY', 'ARRAY'],
    });
    expect(decodedArguments).toHaveLength(3);
    expect(Array.isArray(decodedArguments[0])).toBe(true);
    expect(decodedArguments[0]).toHaveLength(0);
    expect(Array.isArray(decodedArguments[1])).toBe(true);
    expect(decodedArguments[1]).toHaveLength(0);
    expect(Array.isArray(decodedArguments[2])).toBe(true);
    expect(decodedArguments[2]).toHaveLength(0);
  });

  it('should correctly decode an single uint', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiArrayType([new AbiUintType(10)]),
      ]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['ARRAY'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(Array.isArray(decodedArguments[0])).toBe(true);
    expect(decodedArguments[0]).toHaveLength(1);
  });

  it('should correctly decode SingleInteger', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([new AbiUintType(98127491)]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['UINT'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(decodedArguments[0].toString()).toEqual('98127491');
  });

  it('should correctly decode IntegerAndAddress', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiUintType(324124),
        new AbiAddressType('0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'),
      ]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['UINT', 'ADDRESS'],
    });
    expect(decodedArguments).toHaveLength(2);
    expect(decodedArguments[0].toString()).toEqual('324124');
    expect(decodedArguments[1].toString()).toEqual(
      '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'
    );
  });

  it('should correctly decode GithubWikiTest', () => {
    const encodeArguments = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiUintType(291),
        new AbiArrayType([
          new AbiUintType(1110, 32),
          new AbiUintType(1929, 32),
        ]),
        new AbiStringType('1234567890', 10),
        new AbiStringType('Hello, world!'),
      ]),
    });
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: encodeArguments,
      types: ['UINT', 'ARRAY', 'BYTES', 'DYNAMIC_BYTES'],
    });
    expect(decodedArguments).toHaveLength(4);
    expect(decodedArguments[0].toString()).toEqual('291');
    expect(Array.isArray(decodedArguments[1])).toBe(true);
    expect(Array.isArray(decodedArguments[2])).toBe(false);
    expect(decodedArguments[2].toString()).toBe('1234567890');
    expect(decodedArguments[3].toString()).toBe('Hello, world!');
  });

  it('should correctly decode functions', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding: 'f8a8fd6d',
      types: ['FUNCTION'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(getBuffer(decodedArguments[0])?.toString('hex')).toBe('f8a8fd6d');
  });

  it('should correctly decode function with bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f300000000000000000000000000000000000000000000000000000000',
      types: ['DYNAMIC_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    const buffer = getBuffer(decodedArguments[0]);
    expect(buffer?.toString('hex')).toBe(
      '472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f3'
    );
  });

  it('should correctly decode function function and bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '0xf8a8fd6d000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f300000000000000000000000000000000000000000000000000000000',
      types: ['FUNCTION', 'DYNAMIC_BYTES'],
    });
    expect(decodedArguments).toHaveLength(2);
    const buffer = getBuffer(decodedArguments[1]);
    expect(buffer?.toString('hex')).toBe(
      '472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f3'
    );
  });

  it('should correctly decode array of one byte', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000012a00000000000000000000000000000000000000000000000000000000000000',
      types: ['ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(
      getArray(decodedArguments[0])
        ?.map((item) => item.toString('hex'))
        .toString()
    ).toBe('2a');
  });

  it('should correctly decode array of two bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000012e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012c00000000000000000000000000000000000000000000000000000000000000',
      types: ['ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(
      getArray(decodedArguments[0])
        ?.map((item) => item.toString('hex'))
        .join('')
    ).toBe(
      '2e000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly decode array of thee bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010300000000000000000000000000000000000000000000000000000000000000',
      types: ['ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(
      getArray(decodedArguments[0])
        ?.map((item) => item.toString('hex'))
        .join('')
    ).toBe(
      '010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly decode array of four bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000010100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000102000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010400000000000000000000000000000000000000000000000000000000000000',
      types: ['ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(
      getArray(decodedArguments[0])
        ?.map((item) => item.toString('hex'))
        .join('')
    ).toBe(
      '0100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly decode array of five bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000001010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000103000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010500000000000000000000000000000000000000000000000000000000000000',
      types: ['ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(1);
    expect(
      getArray(decodedArguments[0])
        ?.map((item) => item.toString('hex'))
        .join('')
    ).toBe(
      '01000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly decode array of single large bytes', () => {
    const decodedArguments = new AbiStructDecoder().decode({
      encoding:
        '0000000000000000000000000000000000000000000000000000000062dd9e6b00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f300000000000000000000000000000000000000000000000000000000',
      types: ['UINT', 'ARRAY_BYTES'],
    });
    expect(decodedArguments).toHaveLength(2);
    expect(decodedArguments[0].toString()).toBe('1658691179');
    const array = getArray(decodedArguments[1]);
    expect(array?.length).toBe(1);
    expect(getBuffer(array && array[0])?.toString('hex')).toBe(
      '472b43f300000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000096344024a1e9187fb706400000000000000000000000000000000000000000000000000000000000000800000000000000000000000004d033cf6e104401ab86b756aa915a7c2867e5c580000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008129b03c15ec6e7373b57de20e60d023b8f377f3'
    );
  });
});
