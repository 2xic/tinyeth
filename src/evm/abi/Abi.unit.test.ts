import BigNumber from 'bignumber.js';
import { Uint } from '../../rlp/types/Uint';
import { Abi } from './Abi';
import { AbiStruct } from './AbiStruct';
import { AddressType } from './AddressType';
import { ArrayType } from './ArrayType';
import { StringType } from './StringType';
import { UintType } from './UintType';

describe('Abi', () => {
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
      new AbiStruct([
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
      arguments: new AbiStruct([new UintType(50), new UintType(50)]),
    });
    expect(encodeFunction).toBe(
      '1c3667e500000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032'
    );
  });

  describe('https://github.com/ethereum/tests/blob/develop/ABITests/basic_abi_tests.json', () => {
    it('should correctly encode SingleInteger', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStruct([new UintType(98127491)]),
      });
      expect(encodeFunction).toBe(
        '0000000000000000000000000000000000000000000000000000000005d94e83'
      );
    });

    it('should correctly encode IntegerAndAddress', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStruct([
          new UintType(324124),
          new AddressType('0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'),
        ]),
      });
      expect(encodeFunction).toBe(
        '000000000000000000000000000000000000000000000000000000000004f21c000000000000000000000000cd2a3d9f938e13cd947ec05abc7fe734df8dd826'
      );
    });

    it('should correctly encode GithubWikiTest', () => {
      const encodeFunction = new Abi().encodeArguments({
        arguments: new AbiStruct([
          new UintType(291),
          new ArrayType([1110, 1929]),
          new StringType('1234567890'),
          new StringType('Hello, world!'),
        ]),
      });
      expect(encodeFunction).toBe(
        '00000000000000000000000000000000000000000000000000000000000001230000000000000000000000000000000000000000000000000000000000000080313233343536373839300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004560000000000000000000000000000000000000000000000000000000000000789000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000'
      );
    });
  });
});
