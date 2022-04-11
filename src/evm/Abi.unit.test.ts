import BigNumber from 'bignumber.js';
import { Uint } from '../rlp/types/Uint';
import { cleanString } from '../utils';
import { Abi } from './Abi';

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
});
