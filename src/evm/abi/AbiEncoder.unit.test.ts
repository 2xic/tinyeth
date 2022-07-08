import BigNumber from 'bignumber.js';
import { Uint } from '../../rlp/types/Uint';
import { Abi } from './Abi';
import { AbiStructEncoder } from './AbiStructEncoder';
import { AbiAddressType } from './AbiAddressType';
import { AbiArrayType } from './AbiArrayType';
import { AbiStringType } from './AbiStringType';
import { AbiUintType } from './AbiUintType';

describe('AbiEncoder', () => {
  it('should correctly encode a function', () => {
    // Reading https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy?utm_source=url&s=r
    const encodeFunction = new Abi().encodeFunction;

    expect(encodeFunction('store(uint256)')).toBe('6057361d');
    expect(encodeFunction('retrieve()')).toBe('2e64cec1');
  });

  it('should correctly encode a function signature with data', () => {
    // Reading https://noxx.substack.com/p/evm-deep-dives-the-path-to-shadowy?utm_source=url&s=r
    const encodeFunction = new Abi().encodeFunctionWithSignature(
      'store(uint256)',
      new Uint({
        n: 256,
        input: new BigNumber('10'),
      })
    );

    expect(encodeFunction).toBe(
      '6057361d000000000000000000000000000000000000000000000000000000000000000a'
    );
  });

  it('should correctly encode a function with a struct parameter', () => {
    const encodeFunction = new Abi().encodeFunctionWithSignature(
      'deposit((uint8,uint8))',
      new AbiStructEncoder([
        new Uint({
          n: 256,
          input: new BigNumber(50),
        }),
        new Uint({
          n: 256,
          input: new BigNumber(50),
        }),
      ])
    );
    expect(encodeFunction).toBe(
      '1c3667e500000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032'
    );
  });

  it('should correctly encode a function with a struct parameter the simple way', () => {
    const encodeFunction = new Abi().simpleFunctionEncoding({
      functionName: 'deposit',
      arguments: new AbiStructEncoder([
        new AbiUintType(50),
        new AbiUintType(50),
      ]),
    });
    expect(encodeFunction).toBe(
      '1c3667e500000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032'
    );
  });

  it('should correctly encode uint32 array and uint ', () => {
    expect(
      new Abi().encodeArguments({
        arguments: new AbiStructEncoder([
          new AbiArrayType([new AbiUintType(5, 32)]),
          new AbiUintType(2),
        ]),
      })
    ).toBe(
      '0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005'
    );
  });

  it('should correctly encode uint and uint32 array', () => {
    expect(
      new Abi().encodeArguments({
        arguments: new AbiStructEncoder([
          new AbiUintType(1),
          new AbiArrayType([new AbiUintType(1, 32)]),
        ]),
      })
    ).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should correctly encode a empty array', () => {
    const encodeFunction = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([new AbiArrayType([])]),
    });
    expect(encodeFunction).toBe(
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly encode empty array`s', () => {
    const encodeFunction = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiArrayType([]),
        new AbiArrayType([]),
        new AbiArrayType([]),
      ]),
    });
    expect(encodeFunction).toBe(
      '0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly encode uint32 array', () => {
    const encodeFunction = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiArrayType([
          new AbiUintType(1110, 32),
          new AbiUintType(1929, 32),
        ]),
      ]),
    });
    expect(encodeFunction).toBe(
      '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789'
    );
  });

  it('should correctly encode multiple parameters', () => {
    const encodeFunction = new Abi().encodeArguments({
      arguments: new AbiStructEncoder([
        new AbiArrayType([
          new AbiUintType(1110, 32),
          new AbiUintType(1929, 32),
        ]),
        new AbiUintType(291, 256),
        new AbiUintType(4, 256),
      ]),
    });
    expect(encodeFunction).toBe(
      '000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001230000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789'
    );
  });

  it('should correctly encode a uint16', () => {
    const output = new AbiUintType('1110', 16).value.encoding;
    expect(output).toBe(
      '0000000000000000000000000000000000000000000000000000000000000456'
    );
  });

  describe('https://github.com/ethereum/tests/blob/develop/ABITests/basic_abi_tests.json', () => {
    it('should correctly encode SingleInteger', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStructEncoder([new AbiUintType(98127491)]),
      });
      expect(encodeFunction).toBe(
        '0000000000000000000000000000000000000000000000000000000005d94e83'
      );
    });

    it('should correctly encode IntegerAndAddress', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStructEncoder([
          new AbiUintType(324124),
          new AbiAddressType('0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'),
        ]),
      });
      expect(encodeFunction).toBe(
        '000000000000000000000000000000000000000000000000000000000004f21c000000000000000000000000cd2a3d9f938e13cd947ec05abc7fe734df8dd826'
      );
    });

    it('should correctly encode first part of GithubWikiTest', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStructEncoder([
          new AbiUintType(291),
          new AbiArrayType([
            new AbiUintType(1110, 32),
            new AbiUintType(1929, 32),
          ]),
        ]),
      });
      expect(encodeFunction).toBe(
        '00000000000000000000000000000000000000000000000000000000000001230000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789'
      );
    });

    it('should correctly encode GithubWikiTest', () => {
      const encodeFunction = new Abi().encodeArguments({
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
      expect(encodeFunction).toBe(
        '00000000000000000000000000000000000000000000000000000000000001230000000000000000000000000000000000000000000000000000000000000080313233343536373839300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000'
      );
    });
  });
});
