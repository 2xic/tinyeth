import BigNumber from 'bignumber.js';
import { Ether } from '../Ether';
import { Abi } from './Abi';
import { AbiStructEncoder } from './AbiStructEncoder';

describe.skip('https://ethernaut.openzeppelin.com/', () => {
  it('should be able to solve level 1', () => {
    const command = new Abi().simpleFunctionEncoding({
      functionName: 'contribute',
      arguments: new AbiStructEncoder([]),
    });
    const wei = new Ether(new BigNumber('0.0099'));
    // eslint-disable-next-line no-console
    console.log(wei.toWei().toString());
    expect(command).toBe('');
    /*
        sendTransaction({
            from: '0x58eA7709A7B43D2bd6eDF3AA86756Bc95D79beEc',
            to: contract.address,
            data: '0xa9342358',
            gas: '210000',
            value: '9900000000000000',
        })
    */
  });
});
