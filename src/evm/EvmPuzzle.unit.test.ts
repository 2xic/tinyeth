import { Evm } from './Evm';
import { Wei } from './Wei';

describe('https://github.com/fvictorio/evm-puzzles', () => {
  it('should be possible to run puzzle 1 contract', () => {
    new Evm(Buffer.from('3456FDFDFDFDFDFD5B00', 'hex'), {
      value: new Wei(8),
      data: Buffer.from('', 'hex'),
    }).execute();
  });

  it('should be possible to run puzzle 2 contract', () => {
    const contract = Buffer.from('34380356FDFD5B00FDFD', 'hex');
    const evm = new Evm(contract, {
      value: new Wei(4),
      data: Buffer.from('', 'hex'),
    }).execute();
    expect(contract.length).toBe(10);
    expect(evm.pc).toBe(0x07);
  });

  it('should be possible to run puzzle 3 contract', () => {
    const contract = Buffer.from('3656FDFD5B00', 'hex');
    const evm = new Evm(contract, {
      value: new Wei(4),
      data: Buffer.from('AAAAAAAA', 'hex'),
    }).execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 4 contract', () => {
    const contract = Buffer.from('34381856FDFDFDFDFDFD5B00', 'hex');
    const value = contract.length ^ 0xa;
    const evm = new Evm(contract, {
      value: new Wei(value),
      data: Buffer.from('', 'hex'),
    }).execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 5 contract', () => {
    const contract = Buffer.from('34800261010014600C57FDFD5B00FDFD', 'hex');
    const evm = new Evm(contract, {
      value: new Wei(16),
      data: Buffer.from('', 'hex'),
    }).execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 6 contract', () => {
    const contract = Buffer.from('60003556FDFDFDFDFDFD5B00', 'hex');
    const evm = new Evm(contract, {
      value: new Wei(16),
      data: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000a',
        'hex'
      ),
    }).execute();
    expect(evm.isRunning).toBe(false);
  });

  it('should be possible run puzzle 7 contract', () => {
    const contract = Buffer.from(
      '36600080373660006000F03B600114601357FD5B00',
      'hex'
    );
    new Evm(contract, {
      value: new Wei(16),
      data: Buffer.from('', 'hex'),
    }).execute();
  });
});
