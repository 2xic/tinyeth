import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { Address } from './Address';
import { Evm } from './Evm';
import { ExposedEvm } from './ExposedEvm';
import { Wei } from './Wei';

describe('https://github.com/fvictorio/evm-puzzles', () => {
  const sender = new Address();
  const gasLimit = new BigNumber(0xffffff);

  it('should be possible to run puzzle 1 contract', () => {
    getClassFromTestContainer(Evm)
      .boot({
        program: Buffer.from('3456FDFDFDFDFDFD5B00', 'hex'),
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(8)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
  });

  it('should be possible to run puzzle 2 contract', () => {
    const contract = Buffer.from('34380356FDFD5B00FDFD', 'hex');
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(4)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(contract.length).toBe(10);
    expect(evm.pc).toBe(0x07);
  });

  it('should be possible to run puzzle 3 contract', () => {
    const contract = Buffer.from('3656FDFD5B00', 'hex');
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(4)),
          data: Buffer.from('AAAAAAAA', 'hex'),
        },
      })
      .execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 4 contract', () => {
    const contract = Buffer.from('34381856FDFDFDFDFDFD5B00', 'hex');
    const value = contract.length ^ 0xa;
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(value)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 5 contract', () => {
    const contract = Buffer.from('34800261010014600C57FDFD5B00FDFD', 'hex');
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 6 contract', () => {
    const contract = Buffer.from('60003556FDFDFDFDFDFD5B00', 'hex');
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from(
            '000000000000000000000000000000000000000000000000000000000000000a',
            'hex'
          ),
        },
      })
      .execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should have correct contract 7 state', () => {
    const contract = Buffer.from(
      '36600080373660006000F03B600114601357FD5B00',
      'hex'
    );
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: getBufferFromHex('60016000526001601ff3'),
        },
        options: {
          debug: true,
        },
      })
      .execute({
        stopAtPc: 0x0c,
      });
    expect(evm.stack.length).toBe(1);
    expect(evm.stack.get(0).toNumber()).toBe(1);

    evm.execute({
      stopAtPc: 0x11,
    });
    expect(evm.stack.length).toBe(2);
    expect(evm.stack.pop().toNumber()).toBe(0x13);
    expect(evm.stack.pop().toNumber()).toBe(0x1);
  });

  it('should be possible run puzzle 7 contract', () => {
    const contract = Buffer.from(
      '36600080373660006000F03B600114601357FD5B00',
      'hex'
    );
    getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: getBufferFromHex('60016000526001601ff3'),
        },
        options: {
          debug: true,
        },
      })
      .execute();
  });

  it('should be possible run puzzle 8 contract', () => {
    const contract = Buffer.from(
      '36600080373660006000F0600080808080945AF1600014601B57FD5B00',
      'hex'
    );
    getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('60056000526001601ff3', 'hex'),
        },
      })
      .execute();
  });

  it('should be possible run puzzle 9 contract', () => {
    const contract = Buffer.from(
      '36600310600957FDFD5B343602600814601457FD5B00',
      'hex'
    );
    getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(2)),
          data: getBufferFromHex('0xffffffff'),
        },
      })
      .execute();
  });

  it('should be possible run puzzle 10 contract', () => {
    const contract = Buffer.from(
      '38349011600857FD5B3661000390061534600A0157FDFDFDFD5B00',
      'hex'
    );
    // calldata length > value
    // calldata % 3 == 0
    // callValue + 0a == pc
    getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(15)),
          data: getBufferFromHex('0x100000'),
        },
      })
      .execute();
  });
});
