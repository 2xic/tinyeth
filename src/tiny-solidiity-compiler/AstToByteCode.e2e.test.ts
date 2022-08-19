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

  it('should correctly handle two functions', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }

            function return2() public pure returns (uint8) {
              return 2;
            }
          }
        `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return1')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    const lastPc = evm.pc;
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return2')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });

  it('should correctly handle three functions', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }

            function return2() public pure returns (uint8) {
              return 2;
            }

            function return3() public pure returns (uint8) {
              return 3;
            }
          }
        `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return1')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    const lastPc = evm.pc;
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return2')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return3')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000003'
    );
  });

  it('should correctly handle four functions', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }

            function return2() public pure returns (uint8) {
              return 2;
            }

            function return3() public pure returns (uint8) {
              return 3;
            }

            function return4() public pure returns (uint8) {
              return 4;
            }
          }
        `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return1')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    const lastPc = evm.pc;
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return2')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return3')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000003'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return4')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000004'
    );
  });

  it('should correctly handle five functions', () => {
    const program = astToByteCode.compile({
      script: `
          contract ReturnContract {
            function return1() public pure returns (uint8) {
                return 1;
            }

            function return2() public pure returns (uint8) {
              return 2;
            }

            function return3() public pure returns (uint8) {
              return 3;
            }

            function return4() public pure returns (uint8) {
              return 4;
            }

            function return5() public pure returns (uint8) {
              return 5;
            }
          }
        `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return1')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    const lastPc = evm.pc;
    evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return2')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return3')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000003'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return4')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000004'
    );

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return5')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000005'
    );
  });

  it('should correctly deal with an if statement', () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1() public pure returns (uint8) {
            if (1 == 1) {
              return 2;
            } else {
              return 1;
            }
          }
        }
    `,
    });

    evm.boot({
      program,
      context: {
        data: getBufferFromHex(new Abi().encodeFunction('return1')),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
      },
    });
    evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });
});
