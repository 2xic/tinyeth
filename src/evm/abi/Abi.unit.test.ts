import BigNumber from 'bignumber.js';
import { Uint } from '../../rlp/types/Uint';
import { Abi } from './Abi';
import { AbiStruct } from './AbiStruct';
import { Uint8 } from './Uint8';

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
      arguments: new AbiStruct([new Uint8(50), new Uint8(50)]),
    });
    expect(encodeFunction).toBe(
      '1c3667e500000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032'
    );
  });
});
