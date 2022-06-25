import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { Reverted } from './errors/Reverted';
import { StackUnderflow } from './errors/StackUnderflow';
import { Evm } from './Evm';
import { ExposedEvm } from './ExposedEvm';
import { MnemonicParser } from './MnemonicParser';
import { Wei } from './Wei';

describe('evm', () => {
  it('should step through a simple contract', () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    const evm = getClassFromTestContainer(ExposedEvm).boot(
      Buffer.from('6001600081905550', 'hex'),
      {
        nonce: 1,
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      }
    );
    evm.step();
    expect(evm.stack.toString()).toBe([0x1].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0, 0x1].toString());

    evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x1, 0x0].toString());
    expect(evm.storage.read({ key: 0x0 }).toNumber()).toBe(0);

    expect(evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([0x1].toString());
    expect(evm.storage.read({ key: 0x0 }).toNumber()).toBe(0x1);

    expect(evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage.read({ key: 0x0 }).toNumber()).toBe(0x1);

    expect(evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage.read({ key: 0x0 }).toNumber()).toBe(0x1);
  });

  it('should execute a simple contract', () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    const evm = getClassFromTestContainer(ExposedEvm).boot(
      Buffer.from('6001600081905550', 'hex'),
      {
        nonce: 1,
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      }
    );
    evm.execute();

    expect(evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(evm.storage.read({ key: 0x0 }).toNumber()).toBe(0x1);
  });

  it('should be able to run a basic contract', () => {
    // example from https://medium.com/@eiki1212/explaining-ethereum-contract-abi-evm-bytecode-6afa6e917c3b
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(
        Buffer.from(
          '6080604052348015600f57600080fd5b5060878061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063037a417c14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000600190509056fea265627a7a7230582050d33093e20eb388eec760ca84ba30ec42dadbdeb8edf5cd8b261e89b8d4279264736f6c634300050a0032',
          'hex'
        ),
        {
          nonce: 1,
          value: new Wei(0),
          data: Buffer.from('', 'hex'),
        }
      )
      .execute({
        stopAtOpcode: 0x39,
      });
    evm.step();

    expect(
      evm.memory.memory
        .toString('hex')
        .startsWith(
          '6080604052348015600f57600080fd5b506004361060285760003560e01c8063037a417c14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b6000600190509056fea265627a7a7230582050d33093e20eb388eec760ca84ba30ec42dadbdeb8edf5cd8b261e89b8d4279264736f6c634300050a003200000000000000000000000000000000000000000000000000'
        )
    ).toBe(true);

    evm.execute();

    expect(evm.callingContextReturnData).toBeTruthy();
  });

  it('should correctly run simple CREATE opcode contract', () => {
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(Buffer.from('600060006000F0', 'hex'), {
        nonce: 1,
        value: new Wei(8),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    const contracts = evm.network.contracts;
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);
    expect(contracts[0].length).toBe(0);
  });

  it('should correctly run complicated CREATE opcode', () => {
    // https://www.evm.codes/playground?callValue=9&unit=Wei&codeType=Mnemonic&code='%2F%2F%20Createznzccount%20withq%20weiznd%204%20FFzs%20codev3qx63FFFFFFFF60005260046000F3~0yMSTORE~13~0~0yCREATE%20'~v%20z%20ay%5CnvyPUSH1q%200%01qvyz~_
    const evm = getClassFromTestContainer(ExposedEvm).boot(
      Buffer.from('6C63FFFFFFFF60005260046000F3600052600D60006000F0', 'hex'),
      {
        nonce: 1,
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
    expect(evm.stack.get(1).toString()).toBe('0');
    expect(evm.stack.length).toBe(2);

    evm.step();

    expect(evm.memory.memory.slice(0, 32).toString('hex')).toBe(
      '0000000000000000000000000000000000000063ffffffff60005260046000f3'
    );

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.length).toBe(1);

    evm.step();

    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    evm.step();

    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);
    expect(evm.memory.memory.slice(0, 32).toString('hex')).toBe(
      '0000000000000000000000000000000000000063ffffffff60005260046000f3'
    );

    evm.step();

    const contracts = evm.network.contracts;
    expect(evm.stack.length).toBe(1);
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);

    // EVM example says it should be 4, but I don't see why yet.
    // not sure -
    // expect(contracts[0].length).toBe(4);
  });

  it('should correctly run the puzzle 7 contract opcodes', () => {
    const contract = Buffer.from(
      '36600080373660006000F03B600114601357FD5B00',
      'hex'
    );
    const evm = getClassFromTestContainer(ExposedEvm).boot(contract, {
      nonce: 1,
      value: new Wei(16),
      data: Buffer.from('', 'hex'),
    });
    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    evm.step();
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    evm.step();
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);

    evm.step();
    expect(evm.stack.length).toBe(0);
    expect(evm.memory.memory.filter((item) => item !== 0).length).toBe(0);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    evm.step();
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);

    evm.step();
    expect(evm.stack.length).toBe(1);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('1');
    expect(evm.stack.length).toBe(2);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('13');
    expect(evm.stack.length).toBe(2);

    evm.step();
    expect(evm.isRunning).toBe(true);

    expect(() => evm.step()).toThrowError(StackUnderflow);
  });

  it('should correctly run REVERT opcode', () => {
    const contract = Buffer.from(
      '7FFF0100000000000000000000000000000000000000000000000000000000000060005260026000FD',
      'hex'
    );
    const evm = getClassFromTestContainer(ExposedEvm).boot(contract, {
      nonce: 1,
      value: new Wei(16),
      data: Buffer.from('', 'hex'),
    });
    expect(() => evm.execute()).toThrow(Reverted);
    expect(evm.callingContextReturnData?.toString('hex')).toBe('ff01');
  });

  it('should correctly run CREATE and EXTCODESIZE opcode', () => {
    const code = [
      '7F7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', // PUSH32 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      '6000', // PUSH1 0
      '52', // MSTORE
      '7FFF60005260206000F30000000000000000000000000000000000000000000000', // PUSH32 0xFF60005260206000F30000000000000000000000000000000000000000000000
      '6020', // PUSH1 32
      '52', // MSTORE
      '6029', // PUSH 41
      '6000', // PUSH 0
      '6000', // PUSH 0
      'F0', // CREATE
      '3B', // EXTCODESIZE
    ].join('');
    const contract = Buffer.from(code, 'hex');
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack).toHaveLength(1);
    expect(evm.stack.get(0).toString()).toBe('32');
  });

  it('should correctly run swap 1', () => {
    const code = ['6001', '6001', '6002', '90'].join('');
    const contract = Buffer.from(code, 'hex');
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.pop().toString()).toBe('1');
    expect(evm.stack.pop().toString()).toBe('2');
    expect(evm.stack.pop().toString()).toBe('1');
  });

  it('should correctly run swap 5', () => {
    const code = ['6002', '6000', '6000', '6000', '6000', '6001', '94'].join(
      ''
    );
    const contract = Buffer.from(code, 'hex');
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0, 0, 0, 0, 2].toString());
  });

  it('should correctly compute the gas cost of simple transactions', () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21003);
  });

  it('should correctly compute the gas cost of simple transactions with zero data', () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('0000', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21011);
  });

  it('should correctly compute the gas cost of simple transactions with non zero data', () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('0001', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21023);
  });

  it('should correctly execute SWAP16', () => {
    // example from https://www.evm.codes/#9f
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        // Set state
        PUSH1 2
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 1

        // Swap
        SWAP16
    `,
    });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21054);
    expect(evm.stack.toString()).toBe(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2].toString()
    );
  });

  it('should correctly execute DUP16', () => {
    // example from https://www.evm.codes/#8f
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        // Set state
        PUSH1 1
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0

        // Duplicate
        DUP16
    `,
    });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21051);
    expect(evm.stack.toString()).toBe(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1].toString()
    );
  });
});
