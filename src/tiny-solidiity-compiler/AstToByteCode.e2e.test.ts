import BigNumber from 'bignumber.js';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { Abi } from '../evm';
import { Address } from '../evm/Address';
import { Reverted } from '../evm/errors/Reverted';
import { Wei } from '../evm/eth-units/Wei';
import { Evm } from '../evm/Evm';
import { ExposedEvm } from '../evm/ExposedEvm';
import { Uint } from '../rlp/types/Uint';
import { getBufferFromHex } from '../utils';
import { AstToByteCode } from './AstToByteCode';

describe('AstToByteCode', () => {
  let astToByteCode: AstToByteCode;
  let evm: ExposedEvm;

  beforeEach(() => {
    const container = new UnitTestContainer().create({
      loggingEnabled: true,
    });
    astToByteCode = container.get(AstToByteCode);
    evm = container.get(Evm) as ExposedEvm;
  });

  it('should correctly compile, and deploy contract', async () => {
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should not be able to pay a non-payable function', async () => {
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
        receiver: new Address(),
      },
    });

    await expect(() => evm.execute()).rejects.toThrowError(Reverted);
  });

  it('should revert trying to call non existing function', async () => {
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
        receiver: new Address(),
      },
    });
    await expect(() => evm.execute()).rejects.toThrowError(Reverted);
  });

  it('should correctly increment a variable', async () => {
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(Object.entries(evm.storage.storage).length).toBe(1);
    evm.resetPc();

    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });

  it('should correctly handle two functions', async () => {
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
        receiver: new Address(),
      },
    });
    const lastPc = evm.pc;
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });

  it('should correctly handle three functions', async () => {
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
        receiver: new Address(),
      },
    });
    const lastPc = evm.pc;
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000003'
    );
  });

  it('should correctly handle four functions', async () => {
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
        receiver: new Address(),
      },
    });
    const lastPc = evm.pc;
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000004'
    );
  });

  it('should correctly handle five functions', async () => {
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
        receiver: new Address(),
      },
    });
    const lastPc = evm.pc;
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
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
        receiver: new Address(),
      },
    });
    await evm.execute();
    expect(evm.pc).not.toBe(lastPc);
    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000005'
    );
  });

  it('should correctly deal with an if statement', async () => {
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
        receiver: new Address(),
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });

  it('should correctly deal with an else statement', async () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1() public pure returns (uint8) {
            if (1 == 2) {
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
        receiver: new Address(),
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should correctly deal nested if statements', async () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1() public pure returns (uint8) {
            if (1 == 1) {
              if (1 == 1) {
                return 2;
              }
            }
            return 1;
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
        receiver: new Address(),
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000002'
    );
  });

  it('should correctly deal with calldata long', async () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1(uint8 value) public pure returns (uint8) {
            if (1 == 2) {
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
        data: getBufferFromHex(
          // TODO: this is the wrong encoding because we don't include the arguments
          '0x797fa60d000000000000000000000000000000000000000000000000000000000000000a'
        ),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
        receiver: new Address(),
      },
      options: {
        debug: true,
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should correctly deal with input arguments', async () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1(uint8 value) public pure returns (uint8) {
            return value;
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
        receiver: new Address(),
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly deal with input arguments when they are set', async () => {
    const program = astToByteCode.compile({
      script: `
        contract ReturnContract {
          function return1(uint8 value) public pure returns (uint8) {
            return value;
          }
        }
    `,
    });

    evm.boot({
      program,
      context: {
        // TODO: this is the wrong encoding because we don't include the arguments
        data: getBufferFromHex(
          '0x797fa60d0000000000000000000000000000000000000000000000000000000000000000'
        ),
        value: new Wei(new BigNumber(0)),
        nonce: 0,
        gasLimit: new BigNumber(0),
        sender: new Address(),
        receiver: new Address(),
      },
      options: {
        debug: true,
      },
    });
    await evm.execute();

    expect(evm.callingContextReturnData?.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000010'
    );
  });
});
