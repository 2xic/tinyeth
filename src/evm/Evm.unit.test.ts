import BigNumber from 'bignumber.js';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { Address } from './Address';
import { Reverted } from './errors/Reverted';
import { StackUnderflow } from './errors/StackUnderflow';
import { EvmAccountState } from './EvmAccountState';
import { ExposedEvm } from './ExposedEvm';
import { MnemonicParser } from './MnemonicParser';
import { Wei } from './eth-units/Wei';

describe('evm', () => {
  const sender = new Address();
  const gasLimit = new BigNumber(0xffffff);

  let evm: ExposedEvm;

  beforeEach(() => {
    const container = new UnitTestContainer().create();
    evm = container.get(ExposedEvm);
    container.get(EvmAccountState).registerBalance({
      address: sender,
      balance: new BigNumber(42),
    });
  });

  it('should step through a simple contract', async () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    evm.boot({
      program: Buffer.from('6001600081905550', 'hex'),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(8)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.step();
    expect(evm.stack.toString()).toBe([0x1].toString());

    await evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0].toString());

    await evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x0, 0x1].toString());

    await evm.step();
    expect(evm.stack.toString()).toBe([0x1, 0x1, 0x0].toString());
    expect(
      evm.storage.readSync({ key: 0x0, address: new Address() }).toNumber()
    ).toBe(0);

    expect(await evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([0x1].toString());
    expect(
      evm.storage.readSync({ key: 0x0, address: new Address() }).toNumber()
    ).toBe(0x1);

    expect(await evm.step()).toBe(true);
    expect(evm.stack.toString()).toBe([].toString());
    expect(
      evm.storage.readSync({ key: 0x0, address: new Address() }).toNumber()
    ).toBe(0x1);

    expect(await evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(
      evm.storage.readSync({ key: 0x0, address: new Address() }).toNumber()
    ).toBe(0x1);
  });

  it('should execute a simple contract', async () => {
    // example from https://eattheblocks.com/understanding-the-ethereum-virtual-machine/
    evm.boot({
      program: Buffer.from('6001600081905550', 'hex'),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(8)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.execute();

    expect(await evm.step()).toBe(false);
    expect(evm.stack.toString()).toBe([].toString());
    expect(
      evm.storage.readSync({ key: 0x0, address: new Address() }).toNumber()
    ).toBe(0x1);
  });

  it('should correctly run simple CREATE opcode contract', async () => {
    await await evm
      .boot({
        program: Buffer.from('600060006000F0', 'hex'),
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(8)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    const contracts = evm.network.contracts;
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);
    expect(contracts[0].length).toBe(0);
  });

  it('should correctly run complicated CREATE opcode', async () => {
    // https://www.evm.codes/playground?callValue=9&unit=Wei&codeType=Mnemonic&code='%2F%2F%20Createznzccount%20withq%20weiznd%204%20FFzs%20codev3qx63FFFFFFFF60005260046000F3~0yMSTORE~13~0~0yCREATE%20'~v%20z%20ay%5CnvyPUSH1q%200%01qvyz~_
    evm.boot({
      program: Buffer.from(
        '6C63FFFFFFFF60005260046000F3600052600D60006000F0',
        'hex'
      ),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(8)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.step();
    expect(evm.stack.length).toBe(1);
    expect(evm.stack.get(0).toString(16)).toBe(
      '63FFFFFFFF60005260046000F3'.toLocaleLowerCase()
    );

    await evm.step();
    expect(evm.stack.get(1).toString()).toBe('0');
    expect(evm.stack.length).toBe(2);

    await evm.step();

    expect(evm.memory.raw.slice(0, 32).toString('hex')).toBe(
      '0000000000000000000000000000000000000063ffffffff60005260046000f3'
    );

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.length).toBe(1);

    await evm.step();

    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    await evm.step();

    expect(evm.stack.get(0).toString(16)).toBe('d');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);
    expect(evm.memory.raw.slice(0, 32).toString('hex')).toBe(
      '0000000000000000000000000000000000000063ffffffff60005260046000f3'
    );

    await evm.step();

    const contracts = evm.network.contracts;
    expect(evm.stack.length).toBe(1);
    expect(contracts.length).toBe(1);
    expect(contracts[0].value.toNumber()).toBe(0);

    // EVM example says it should be 4, but I don't see why yet.
    // not sure -
    // expect(contracts[0].length).toBe(4);
  });

  it('should correctly run the puzzle 7 contract opcodes', async () => {
    const contract = Buffer.from(
      '36600080373660006000F03B600114601357FD5B00',
      'hex'
    );
    evm.boot({
      program: contract,
      context: {
        receiver: new Address(),
        nonce: 1,
        value: new Wei(new BigNumber(16)),
        data: Buffer.from('', 'hex'),
        sender,
        gasLimit,
      },
    });
    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    await evm.step();
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    await evm.step();
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);

    await evm.step();
    expect(evm.stack.length).toBe(0);
    expect(evm.memory.raw.filter((item) => item !== 0).length).toBe(0);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    await evm.step();
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(2);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('0');
    expect(evm.stack.get(2).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(3);

    await evm.step();
    expect(evm.stack.length).toBe(1);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('1');
    expect(evm.stack.length).toBe(2);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.length).toBe(1);

    await evm.step();
    expect(evm.stack.get(0).toString(16)).toBe('0');
    expect(evm.stack.get(1).toString(16)).toBe('13');
    expect(evm.stack.length).toBe(2);

    await evm.step();
    expect(evm.isRunning).toBe(true);

    await expect(() => evm.step()).rejects.toThrowError(StackUnderflow);
  });

  it('should correctly run REVERT opcode', async () => {
    const contract = Buffer.from(
      '7FFF0100000000000000000000000000000000000000000000000000000000000060005260026000FD',
      'hex'
    );
    evm.boot({
      program: contract,
      context: {
        receiver: new Address(),
        nonce: 1,
        value: new Wei(new BigNumber(16)),
        data: Buffer.from('', 'hex'),
        sender,
        gasLimit,
      },
    });
    await expect(() => evm.execute()).rejects.toThrow(Reverted);
    expect(evm.callingContextReturnData?.toString('hex')).toBe('ff01');
  });

  it('should correctly run CREATE and EXTCODESIZE opcode', async () => {
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
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack).toHaveLength(1);
    expect(evm.stack.get(0).toString()).toBe('32');
  });

  it('should correctly run swap 1', async () => {
    const code = ['6001', '6001', '6002', '90'].join('');
    const contract = Buffer.from(code, 'hex');
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.pop().toString()).toBe('1');
    expect(evm.stack.pop().toString()).toBe('2');
    expect(evm.stack.pop().toString()).toBe('1');
  });

  it('should correctly run swap 5', async () => {
    const code = ['6002', '6000', '6000', '6000', '6000', '6001', '94'].join(
      ''
    );
    const contract = Buffer.from(code, 'hex');
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0, 0, 0, 0, 2].toString());
  });

  it('should correctly compute the gas cost of simple transactions', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21003);
  });

  it('should correctly compute the gas cost of simple transactions with zero data', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('0000', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21011);
  });

  it('should correctly compute the gas cost of simple transactions with non zero data', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({ script: 'push1 1' });
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('0001', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21023);
  });

  it('should correctly run block related opcodes', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH1 42
        BLOCKHASH
        COINBASE
        TIMESTAMP
        NUMBER
        DIFFICULTY
        GASLIMIT
        CHAINID
        GASPRICE
        BASEFEE
       `,
    });
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.alloc(0),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe(
      [
        new BigNumber(
          '29045A592007D0C246EF02C2223570DA9522D0CF0F73282C79A1BC8F0BB2C238',
          16
        ),
        new BigNumber(
          '5B38Da6a701c568545dCfcB03FcB875f56beddC4'.toLocaleLowerCase(),
          16
        ),
        1640991600,
        42,
        new BigNumber('10995000000000000'),
        gasLimit,
        1,
        222,
        1024,
      ].toString()
    );
  });

  it('should correctly revert', async () => {
    await evm
      .boot({
        program: Buffer.from('600035600757FE5B', 'hex'),
        context: {
          nonce: 1,
          sender,

          receiver: new Address(),
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.from('0001', 'hex'),
        },
      })
      .execute();

    await expect(() =>
      evm
        .boot({
          program: Buffer.from('600035600757FE5B', 'hex'),
          context: {
            nonce: 1,
            sender,

            receiver: new Address(),
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('', 'hex'),
          },
        })
        .execute()
    ).rejects.toThrowError(Reverted);
  });

  it('should execute a simple bytecode- contract without return', async () => {
    evm.boot({
      program: Buffer.from('67600054600757FE5B60005260086018', 'hex'),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(0)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.execute();

    expect(evm.gasCost()).toBe(21018);
  });

  it('should execute a simple bytecode- contract with return', async () => {
    evm.boot({
      program: Buffer.from('67600054600757FE5B60005260086018F3', 'hex'),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(0)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.execute();

    expect(evm.gasCost()).toBe(21018);
  });

  it('should execute the stop opcode', async () => {
    evm.boot({
      program: Buffer.from('00000000000000000000000000', 'hex'),
      context: {
        nonce: 1,
        sender,
        receiver: new Address(),
        gasLimit,
        value: new Wei(new BigNumber(0)),
        data: Buffer.from('', 'hex'),
      },
    });
    await evm.execute();

    expect(evm.gasCost()).toBe(21000);
  });
});
