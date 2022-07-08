import { Abi } from './Abi';
import { AbiArrayType } from './AbiArrayType';
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
});
