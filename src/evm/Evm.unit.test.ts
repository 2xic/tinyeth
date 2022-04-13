import { Evm } from './Evm';
import { Wei } from './Wei';

describe('evm', () => {
  it('should step through a simple contract', () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    const evm = new Evm(Buffer.from('6001600081905550', 'hex'), {
      value: new Wei(8),
      data: Buffer.from('', 'hex'),
    });
    evm.step();
    expect(evm.stack.toString()).toBe([0x1].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0, 0x1].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x1, 0x0].toString());
    expect(evm.storage[0x0]).toBe(undefined);

    expect(evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([0x1].toString());
    expect(evm.storage[0x0]).toBe(0x1);

    expect(evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage[0x0]).toBe(0x1);

    expect(evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage[0x0]).toBe(0x1);
  });

  it('should execute a simple contract', () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    const evm = new Evm(Buffer.from('6001600081905550', 'hex'), {
      value: new Wei(8),
      data: Buffer.from('', 'hex'),
    });
    evm.execute();

    expect(evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage[0x0]).toBe(0x1);
  });

  it.skip('should be able to run a basic contract', () => {
    // example from https://medium.com/@eiki1212/explaining-ethereum-contract-abi-evm-bytecode-6afa6e917c3b
    new Evm(
      Buffer.from(
        '6080604052348015600f57600080fd5b5060878061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063037a417c14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000600190509056fea265627a7a7230582050d33093e20eb388eec760ca84ba30ec42dadbdeb8edf5cd8b261e89b8d4279264736f6c634300050a0032',
        'hex'
      ),
      {
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      }
    ).execute();
  });

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
      const evm = new Evm(contract, {
        value: new Wei(contract.length ^ 0xa),
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
      const evm = new Evm(contract, {
        value: new Wei(16),
        data: Buffer.from('00', 'hex'),
      }).execute();
      expect(evm.isRunning).toBe(false);
    });
  });
});
