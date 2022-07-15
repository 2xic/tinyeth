import { Abi } from './Abi';
import { AbiAddressType } from './AbiAddressType';
import { AbiArrayType } from './AbiArrayType';
import { AbiStringType } from './AbiStringType';
import { AbiStructDecoder } from './AbiStructDecoder';
import { AbiStructEncoder } from './AbiStructEncoder';
import { AbiUintType } from './AbiUintType';

describe('AbiDecoder', () => {
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
    expect(decodedArguments[1].toString(16)).toEqual(
      'cd2a3d9f938e13cd947ec05abc7fe734df8dd826'
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
});
