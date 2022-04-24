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
    expect(evm.storage[0x0].toNumber()).toBe(0x1);

    expect(evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage[0x0].toNumber()).toBe(0x1);

    expect(evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage[0x0].toNumber()).toBe(0x1);
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
    expect(evm.storage[0x0].toNumber()).toBe(0x1);
  });

  it('should be able to run a basic contract', () => {
    // example from https://medium.com/@eiki1212/explaining-ethereum-contract-abi-evm-bytecode-6afa6e917c3b
    const evm = new Evm(
      Buffer.from(
        '6080604052348015600f57600080fd5b5060878061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063037a417c14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000600190509056fea265627a7a7230582050d33093e20eb388eec760ca84ba30ec42dadbdeb8edf5cd8b261e89b8d4279264736f6c634300050a0032',
        'hex'
      ),
      {
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      }
    ).execute({
      stopAtOpcode: 0x39,
    });
    evm.step();

    expect(
      evm.memory
        .toString('hex')
        .startsWith(
          '6080604052348015600f57600080fd5b506004361060285760003560e01c8063037a417c14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000600190509056fea265627a7a7230582050d33093e20eb388eec760ca84ba30ec42dadbdeb8edf5cd8b261e89b8d4279264736f6c634300050a003200000000000000000000000000000000000000000000000000'
        )
    ).toBe(true);

    evm.execute();

    expect(evm.callingContextReturnData).toBeTruthy();
  });

  it('should correctly run simple CREATE opcode contract', () => {
    const evm = new Evm(Buffer.from('600060006000F0', 'hex'), {
      value: new Wei(8),
      data: Buffer.from('', 'hex'),
    }).execute();
    const contracts = evm.network.contracts;
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);
    expect(contracts[0].length).toBe(0);
  });

  it.skip('should correctly run complicated CREATE opcode', () => {
    // https://www.evm.codes/playground?callValue=9&unit=Wei&codeType=Mnemonic&code='%2F%2F%20Createznzccount%20withq%20weiznd%204%20FFzs%20codev3qx63FFFFFFFF60005260046000F3~0yMSTORE~13~0~0yCREATE%20'~v%20z%20ay%5CnvyPUSH1q%200%01qvyz~_
    const evm = new Evm(
      Buffer.from('6C63FFFFFFFF60005260046000F3600052600D60006000F0', 'hex'),
      {
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      }
    );
    evm.step();
    expect(evm.stack.length).toBe(1);
    expect(evm.stack.get(0).toString(16)).toBe(
      '63FFFFFFFF60005260046000F3'.toLocaleLowerCase()
    );

    evm.step();
    expect(evm.stack.length).toBe(2);

    evm.step();

    expect(evm.memory.slice(0, 32).toString('hex')).toBe(
      '0000000000000000000000000000000000000063ffffffff60005260046000f3'
    );
    evm.step();
    expect(evm.stack.toString()).toBe([13].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([13, 0].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([13, 0, 0].toString());

    evm.step();

    const contracts = evm.network.contracts;
    expect(evm.stack.length).toBe(1);
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);
    // EVM example says it should be 4, but I don't see why yet.
    expect(contracts[0].length).toBe(4);
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

    it.skip('should be possible run puzzle 7 contract', () => {
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
