import BigNumber from 'bignumber.js';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { Abi } from '../evm';
import { Address } from '../evm/Address';
import { Reverted } from '../evm/errors/Reverted';
import { Wei } from '../evm/eth-units/Wei';
import { Evm } from '../evm/Evm';
import { ExposedEvm } from '../evm/ExposedEvm';
import { getBufferFromHex } from '../utils';
import { AstToByteCode } from './AstToByteCode';

describe('AstToByteCode', () => {
  let astToByteCode: AstToByteCode;
  let evm: ExposedEvm;

  beforeEach(() => {
    const container = new UnitTestContainer().create();
    astToByteCode = container.get(AstToByteCode);
    evm = container.get(Evm) as ExposedEvm;
  });

  it('should correctly compile, and deploy contract', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }
          }
        `,
    });
    const encodeFunction = new Abi().encodeFunction('return1');

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(encodeFunction),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should not be able to pay a non-payable function', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }
          }
        `,
    });
    const encodeFunction = new Abi().encodeFunction('return1');

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(encodeFunction),
        value: new Wei(new BigNumber(10)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });

    expect(() => evm.execute()).toThrowError(Reverted);
  });

  it('should revert trying to call non existing function', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }
          }
        `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex('0xdeadbeef'),
        value: new Wei(new BigNumber(10)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    expect(() => evm.execute()).toThrowError(Reverted);
  });

  it('should correctly increment a variable', () => {
    const program = astToByteCode.compile({
      script: `
        contract Counter {
          uint8 public count;
      
          function inc() public returns (uint8) {
              count += 1;
              return count;
          }
      }
      `,
    });

    const encodeFunction = new Abi().encodeFunction('inc');
    evm.boot({
      program,
      context: {
        data: getBufferFromHex(encodeFunction),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(Object.entries(evm.storage.storage).length).toBe(1);
    evm.resetPc();

    evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });
});
