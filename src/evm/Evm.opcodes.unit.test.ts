import BigNumber from 'bignumber.js';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { Address } from './Address';
import { EvmAccountState } from './EvmAccountState';
import { ExposedEvm } from './ExposedEvm';
import { MnemonicParser } from './MnemonicParser';
import { Wei } from './eth-units/Wei';
import { getBufferFromHex } from '../utils';

/*
    The test mnemonic code here is are all from https://www.evm.codes/
    They have great examples, and credit goes to them for creating it :) 
*/
describe('evm.codes', () => {
  const sender = new Address();
  const gasLimit = new BigNumber(0xffffff);
  let evm: ExposedEvm;
  let evmAccountState: EvmAccountState;

  beforeEach(() => {
    const container = new UnitTestContainer().create();
    evm = container.get(ExposedEvm);
    evmAccountState = container.get(EvmAccountState);
    evmAccountState.registerBalance({
      address: sender,
      balance: new BigNumber(42),
    });
  });

  it('should correctly execute negative SUB', async () => {
    evm.stack.push(new BigNumber(1));
    evm.stack.push(
      new BigNumber('10000000000000000000000000000000000000000', 16)
    );
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        SUB
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();

    expect(evm.stack.get(0).toString(16)).toBe(
      'ffffffffffffffffffffffffffffffffffffffff'
    );
  });

  it('should correctly execute negative AND', async () => {
    evm.stack.push(
      new BigNumber('ffffffffffffffffffffffffffffffffffffffff', 16)
    );
    evm.stack.push(
      new BigNumber('ba12222222228d8ba445958a75a0704d566bf2c8', 16)
    );
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        AND
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.get(0).toString(16)).toBe(
      'ba12222222228d8ba445958a75a0704d566bf2c8'
    );
  });

  it('should correctly execute SWAP16', async () => {
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
    expect(evm.totalGasCost).toBe(21054);
    expect(evm.stack.toString()).toBe(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2].toString()
    );
  });

  it('should correctly execute DUP16', async () => {
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
    expect(evm.totalGasCost).toBe(21051);
    expect(evm.stack.toString()).toBe(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1].toString()
    );
  });

  it('should correctly execute MSTORE with offset 0x80 and max value', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        PUSh32 0x80
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    );
  });

  it('should correctly execute MSTORE with offset 0x80 with zero', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0x0
        PUSh32 0x80
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('should correctly execute MSTORE with offset 0x80 with 1', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0x01
        PUSh32 0x80
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  it('should correctly execute MSTORE with zero offset', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        PUSh32 0x0
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    );
  });

  it('should correctly execute MSTORE with 0x10 offset', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        PUSh32 0x10
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      '00000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000'
    );
  });

  it('should correctly execute MSTORE with 0x32 offset', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        PUSh32 0x32
        MSTORE
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000'
    );
  });

  it('should correctly execute DIV', async () => {
    // example from https://www.evm.codes/#04
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        // Example 1
        PUSH1 10
        PUSH1 10
        DIV
        
        // Example 2
        PUSH1 2
        PUSH1 1
        DIV
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 0].toString());
  });

  it.skip('should correctly execute SDIV', async () => {
    // example from https://www.evm.codes/#05
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        // Example 1
        PUSH1 10
        PUSH1 10
        SDIV
        
        // Example 2
        PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
        PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE
        SDIV
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 2].toString());
  });

  it('should correctly execute MOD', async () => {
    // example from https://www.evm.codes/#06
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        // Example 1
        PUSH1 3
        PUSH1 10
        MOD
        
        // Example 2
        PUSH1 5
        PUSH1 17
        MOD
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 2].toString());
  });

  it('should correctly execute MULMOD', async () => {
    // example from https://www.evm.codes/#09
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 8
      PUSH1 10
      PUSH1 10
      MULMOD
      
      // Example 2
      PUSH1 12
      PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      MULMOD
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21034);
    expect(evm.stack.toString()).toBe([4, 9].toString());
  });

  it('should correctly execute EXP', async () => {
    // example from https://www.evm.codes/#0a
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 2
      PUSH1 10
      EXP
      
      // Example 2
      PUSH1 2
      PUSH1 2
      EXP
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([100, 4].toString());
    expect(evm.totalGasCost).toBe(21132);
  });

  it('should correctly execute LT', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 10
      PUSH1 9
      LT
      
      // Example 2
      PUSH1 10
      PUSH1 10
      LT
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute GT', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 9
      PUSH1 10
      GT
      
      // Example 2
      PUSH1 10
      PUSH1 10
      GT
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute SLT', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 9
      PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      SLT
      
      // Example 2
      PUSH1 10
      PUSH1 10
      SLT
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute SGT', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      PUSH1 9
      SGT
      
      // Example 2
      PUSH1 10
      PUSH1 10
      SGT
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute AND', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 0xF
      PUSH1 0xF
      AND
      
      // Example 2
      PUSH1 0
      PUSH1 0xFF
      AND
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([0xf, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute OR', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Example 1
      PUSH1 0xF
      PUSH1 0xF0
      OR
      
      // Example 2
      PUSH1 0xFF
      PUSH1 0xFF
      OR
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([0xff, 0xff].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute LOG3', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        LOG3
        PUSH1 55
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.stack.toString()).toBe([0x37].toString());
  });

  it('should correctly calculate LOG3 gas cost', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        LOG3
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.gasCost()).toBe(22515);
  });

  it('should correctly calculate data load cost', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH1 0
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
          data: getBufferFromHex(
            '0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000004e000000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000006600000000000000000000000000000000000000000000000000000000000000720000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000900000000000000000000000000000000000000000000000000000000'
          ),
        },
      })
      .execute();
    expect(evm.gasCost()).toBe(32867);
  });

  it('should correctly run ADD operator with negative values', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0
        PUSH32 0x00000000000000000000000000000000000000000000000000000000000006e0
        ADD
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
    expect(evm.stack.raw.toString()).toBe([0x6c0].toString());
  });

  it('should correctly run GAS opcode', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0
        PUSH32 0x00000000000000000000000000000000000000000000000000000000000006e0
        ADD
        GAS
    `,
    });
    await evm
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          receiver: new Address(),
          gasLimit: new BigNumber(0xffffffffffff),
          value: new Wei(new BigNumber(16)),
          data: Buffer.alloc(0),
        },
      })
      .execute();
    expect(evm.stack.raw.toString()).toBe([0x6c0, 0xffffffffadec].toString());
  });

  it('should correctly run SUB operator with negative values', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0
        PUSH32 0x00000000000000000000000000000000000000000000000000000000000006e0
        SUB
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
    expect(evm.stack.raw.toString()).toBe([0x700].toString());
  });

  it('should correctly run DELEGATECALL', async () => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: `
      // Create a contract that creates an exception if first slot of storage is 0
      PUSH17 0x67600054600757FE5B60005260086018F3
      PUSH1 0
      MSTORE
      PUSH1 17
      PUSH1 15
      PUSH1 0
      CREATE
      
      // Call with storage slot 0 = 0, returns 0
      PUSH1 0
      PUSH1 0
      PUSH1 0
      PUSH1 0
      DUP5
      PUSH2 0xFFFF
      DELEGATECALL   
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
          data: Buffer.from('', 'hex'),
        },
      })
      .execute();
    expect(evm.memory.raw.length).toBe(32);
  });

  const evmTestCases: Array<EvmTestCaseOptions> = [
    // TODO : Fix -> There is a bug in the contract deployment logic */
    /*
    {
      name: 'EXTCODEHASH',
      script: `
            // Creates a constructor that creates a contract with 4 FF as code
            PUSH13 0x63FFFFFFFF60005260046000F3
            PUSH1 0
            MSTORE

            // Create the contract with the constructor code above
            PUSH1 13
            PUSH1 0
            PUSH1 0
            CREATE // Puts the new contract address on the stack

            // Get the hash
            EXTCODEHASH
        `,
      gasCost: 53121,
      stack: [
        new BigNumber(
          'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
          16
        ),
      ],
    },
    */
    {
      name: 'CALLDATALOAD',
      script: `
        // Example 1
        PUSH1 0
        CALLDATALOAD
        
        // Example 2
        PUSH1 31
        CALLDATALOAD
    `,
      gasCost: null,
      calldata: Buffer.from(
        'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'hex'
      ),
      stack: [
        new BigNumber(
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          16
        ),
        new BigNumber(
          'ff00000000000000000000000000000000000000000000000000000000000000',
          16
        ),
      ],
    },
    {
      name: 'NOT',
      script: `
        PUSH1 0
        NOT
    `,
      gasCost: 21006,
      stack: [
        new BigNumber(
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          16
        ),
      ],
    },
    {
      name: 'BYTE',
      script: `
        // Example 1
        PUSH1 0xFF
        PUSH1 31
        BYTE
        
        // Example 2
        PUSH2 0xFF00
        PUSH1 30
        BYTE
      `,
      gasCost: 21018,
      stack: [0xff, 0xff],
    },
    {
      name: 'SHL',
      script: `
            // Example 1
            PUSH1 1
            PUSH1 1
            SHL
            
            // Example 2
            PUSH32 0xFF00000000000000000000000000000000000000000000000000000000000000
            PUSH1 4
            SHL
        `,
      gasCost: 21018,
      stack: [
        2,
        new BigNumber(
          'f000000000000000000000000000000000000000000000000000000000000000',
          16
        ),
      ],
    },
    {
      name: 'SHR',
      script: `
            // Example 1
            PUSH1 2
            PUSH1 1
            SHR
            
            // Example 2
            PUSH1 0xFF
            PUSH1 4
            SHR
          `,
      gasCost: 21018,
      stack: [1, new BigNumber('f', 16)],
    },
    {
      name: 'SAR',
      script: `
        // Example 1
        PUSH1 2
        PUSH1 1
        SAR
        
        // Example 2
        PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0
        PUSH1 4
        SAR
    `,
      gasCost: 21018,
      stack: [
        1,
        new BigNumber(
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          16
        ),
      ],
    },
    {
      name: 'SMOD',
      script: `
        // Example 1
        PUSH1 3
        PUSH1 10
        SMOD
        
        // Example 2
        PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD
        PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF8
        SMOD
    `,
      gasCost: 21022,
      stack: [
        1,
        new BigNumber(
          'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
          16
        ),
      ],
    },
    {
      name: 'SHA3',
      script: `
            // Put the required value in memory
            PUSH32 0xFFFFFFFF00000000000000000000000000000000000000000000000000000000
            PUSH1 0
            MSTORE
            
            // Call the opcode
            PUSH1 4
            PUSH1 0
            SHA3
        `,
      gasCost: 21054,
      stack: [
        new BigNumber(
          '29045a592007d0c246ef02c2223570da9522d0cf0f73282c79a1bc8f0bb2c238',
          16
        ),
      ],
    },
    {
      name: 'MSIZE',
      script: `
        MSIZE // Initially 0
        PUSH1 0
        MLOAD // Read first word
      `,
      value: new Wei(new BigNumber(0)),
      gasCost: 21011,
      memory:
        '0000000000000000000000000000000000000000000000000000000000000000',
      stack: [0, 0],
    },
    {
      name: 'MSIZE',
      script: `
          MSIZE // Initially 0
          PUSH1 0
          MLOAD // Read first word
          POP
          MSIZE // Now size is 1 word
          PUSH1 0x39
          MLOAD // Read part of third word
        `,
      value: new Wei(new BigNumber(0)),
      memory:
        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      gasCost: 21027,
      stack: [0, 0x20, 0x0],
    },
    {
      name: 'MSIZE',
      script: `
          MSIZE // Initially 0
          PUSH1 0
          MLOAD // Read first word
          POP
          MSIZE // Now size is 1 word
          PUSH1 0x39
          MLOAD // Read part of third word
          POP
          MSIZE // Now size is 3 words
        `,
      value: new Wei(new BigNumber(0)),
      gasCost: 21031,
      stack: [0, 0x20, 0x60],
    },
    {
      name: 'CALLER',
      script: `
          CALLER
      `,
      gasCost: 21002,
      stack: [sender.raw],
    },
    {
      name: 'ORIGIN',
      script: `
          ORIGIN
      `,
      gasCost: 21002,
      stack: [sender.raw],
    },
    {
      name: 'ADDRESS',
      script: `
          ADDRESS
      `,
      gasCost: 21002,
      stack: [sender.raw],
    },
    {
      name: 'GAS',
      script: `
        GAS
      `,
      gasCost: 21002,
      stack: [new BigNumber(0xffffffffadf5)],
      gasLimit: new BigNumber(0xffffffffffff),
    },
    {
      name: 'GAS',
      script: `
        GAS
        PUSH3 21000 // Cost of the transaction
        GASLIMIT // Gas that was given to the context
        SUB
        SUB // Result is the amount of gas used up to and including the GAS instruction
      `,
      gasCost: 21013,
      stack: [2],
      gasLimit: new BigNumber(0xffffffffffff),
    },
    {
      name: 'PC',
      script: `
        PC       // Offset 0
        PC       // Offset 1
        JUMPDEST // Offest 2
        PC       // Offset 3
        PUSH1 1  // Offset 4
        PC       // Offset 6 (previous instructions takes 2 bytes)
      `,
      gasCost: 21012,
      stack: [0, 1, 3, 1, 6],
    },
    {
      name: 'MSTORE8',
      script: `
        // Example 1
        PUSH2 0xFFFF
        PUSH1 0
        MSTORE8
        
        // Example 2
        PUSH1 0xFF
        PUSH1 1
        MSTORE8      
      `,
      gasCost: null, // 21021,
      stack: [],
      memory:
        'ffff000000000000000000000000000000000000000000000000000000000000',
    },
    {
      name: 'SLOAD',
      script: `
        // Set up the state
        PUSH1 46
        PUSH1 0
        SSTORE
        
        // Example 1
        PUSH1 0
        SLOAD
        
        // Example 2
        PUSH1 1
        SLOAD      
      `,
      gasCost: null, // 21021,
      stack: [46, 0],
    },
    {
      name: 'CALL',
      script: `
        // Create a contract that creates an exception if first word of calldata is 0
        PUSH17 0x67600035600757FE5B60005260086018F3
        PUSH1 0
        MSTORE
        PUSH1 17
        PUSH1 15
        PUSH1 0
        CREATE

        // Call with no parameters, return 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP6
        PUSH2 0xFFFF
        CALL

        // Call with non 0 calldata, returns success
        PUSH1 0
        PUSH1 0
        PUSH1 32
        PUSH1 0
        PUSH1 0
        DUP7
        PUSH2 0xFFFF
        CALL
      `,
      gasCost: null,
      stack: null,
      validation: (evm) => {
        const stack = evm.stack;
        const network = evm.network;
        const contract = !!network.contracts.find(
          (item) =>
            item.address.toString() === new Address(evm.stack.get(0)).toString()
        );
        expect(contract).toBe(true);
        expect(stack.pop().isEqualTo(1)).toBe(true);
        expect(stack.pop().isEqualTo(0)).toBe(true);
      },
    },
    /*
    {
      name: 'RETURNDATACOPY',
      script: `    
          // Creates a constructor that creates a contract wich returns 32 FF
          PUSH32 0x7F7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
          PUSH1 0
          MSTORE
          PUSH32 0xFF6000527FFF60005260206000F3000000000000000000000000000000000000
          PUSH1 32
          MSTORE
          PUSH32 0x000000000060205260296000F300000000000000000000000000000000000000
          PUSH1 64
          MSTORE

          // Create the contract with the constructor code above
          PUSH1 77
          PUSH1 0
          PUSH1 0
          CREATE // Puts the new contract address on the stack

          // Call the deployed contract
          PUSH1 0
          PUSH1 0
          PUSH1 0
          PUSH1 0
          DUP5
          PUSH4 0xFFFFFFFF
          STATICCALL

          // Clear the stack
          POP
          POP

          // Clear the memory
          PUSH1 0
          PUSH1 0
          MSTORE
          PUSH1 0
          PUSH1 32
          MSTORE
          PUSH1 0
          PUSH1 64
          MSTORE

          // Example 1
          PUSH1 32
          PUSH1 0
          PUSH1 0
          RETURNDATACOPY

          // Example 2
          PUSH1 1
          PUSH1 31
          PUSH1 32
          RETURNDATACOPY
          `,
      gasCost: null, // 21021,
      stack: [],
      memory:
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    */
    /*
    {
      name: 'RETURNDATASIZE',
      script: `    
        // Creates a constructor that creates a contract wich returns 32 FF
        PUSH32 0x7F7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
        PUSH1 0
        MSTORE
        PUSH32 0xFF6000527FFF60005260206000F3000000000000000000000000000000000000
        PUSH1 32
        MSTORE
        PUSH32 0x000000000060205260296000F300000000000000000000000000000000000000
        PUSH1 64
        MSTORE
        
        // Create the contract with the constructor code above
        PUSH1 77
        PUSH1 0
        PUSH1 0
        CREATE // Puts the new contract address on the stack
        
        // Call the deployed contract
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP5
        PUSH4 0xFFFFFFFF
        STATICCALL
        
        // Now we should have our return data size of 32
        RETURNDATASIZE         
      `,
      gasCost: null, // 21021,
      stack: null,
      validation: (evm) => {
        const stack = evm.stack;
        const network = evm.network;
        expect(stack.pop().isEqualTo(0x20)).toBe(true);
        expect(stack.pop().isEqualTo(1)).toBe(true);
        const contract = !!network.contracts.find(
          (item) =>
            item.address.toString() === new Address(evm.stack.pop()).toString()
        );
        expect(contract).toBe(true);
      },
    },
    */
    {
      name: 'EXTCODESIZE',
      script: `    
        // Creates a constructor that creates a contract with 32 FF as code
        PUSH32 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
        PUSH1 0
        MSTORE
        PUSH32 0xFF60005260206000F30000000000000000000000000000000000000000000000
        PUSH1 32
        MSTORE
        
        // Create the contract with the constructor code above
        PUSH1 41
        PUSH1 0
        PUSH1 0
        CREATE // Puts the new contract address on the stack
        
        // The address is on the stack, we can query the size
        EXTCODESIZE  
      `,
      gasCost: 59551,
      stack: [0x20],
    },
    {
      name: 'EXTCODECOPY',
      script: `    
        // Creates a constructor that creates a contract with 32 FF as code
        PUSH32 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
        PUSH1 0
        MSTORE
        PUSH32 0xFF60005260206000F30000000000000000000000000000000000000000000000
        PUSH1 32
        MSTORE
        
        // Create the contract with the constructor code above
        PUSH1 41
        PUSH1 0
        PUSH1 0
        CREATE // Puts the new contract address on the stack
        
        // Clear the memory for the examples
        PUSH1 0
        PUSH1 0
        MSTORE
        PUSH1 0
        PUSH1 32
        MSTORE
        
        // Example 1
        PUSH1 32
        PUSH1 0
        PUSH1 0
        DUP4
        EXTCODECOPY
        
        // Example 2
        PUSH1 8
        PUSH1 31
        PUSH1 0
        DUP4
        EXTCODECOPY       
      `,
      gasCost: 59699,
      stack: null,
      memory:
        'ff00000000000000ffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000',
      validation: (evm) => {
        const network = evm.network;
        const contract = !!network.contracts.find(
          (item) =>
            item.address.toString() === new Address(evm.stack.pop()).toString()
        );
        expect(contract).toBe(true);
      },
    },
    {
      name: 'GAS',
      script: `
        SELFBALANCE
      `,
      gasCost: 21005,
      stack: [42],
    },
    {
      name: 'DELEGATECALL',
      script: `
        // Create a contract that creates an exception if first slot of storage is 0
        PUSH17 0x67600054600757FE5B60005260086018F3
        PUSH1 0
        MSTORE
        PUSH1 17
        PUSH1 15
        PUSH1 0
        CREATE
        
        // Call with storage slot 0 = 0, returns 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP5
        PUSH2 0xFFFF
        DELEGATECALL
        
        // Set first slot in the current contract
        PUSH1 1
        PUSH1 0
        SSTORE
        
        // Call with storage slot 0 != 0, returns 1
        PUSH1 0
        PUSH1 0
        PUSH1 32
        PUSH1 0
        DUP6
        PUSH2 0xFFFF
        DELEGATECALL
      `,
      gasCost: null,
      memory:
        '00000000000000000000000000000067600054600757fe5b60005260086018f3',
      stack: null,
      validation: (evm) => {
        const stack = evm.stack;
        const network = evm.network;
        expect(stack.pop().isEqualTo(1)).toBe(true);
        expect(stack.pop().isEqualTo(0)).toBe(true);
        const contract = !!network.contracts.find(
          (item) =>
            item.address.toString() === new Address(evm.stack.pop()).toString()
        );
        expect(contract).toBe(true);
      },
    },
    {
      name: 'CREATE2',
      script: `
        // Create an account with 0 wei and no code
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        CREATE2
        
        // Cannot recreate with the same parameters, because it generates the same address
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        CREATE2
        
        // Create an account with 9 wei and no code
        PUSH1 1
        PUSH1 0
        PUSH1 0
        PUSH1 9
        CREATE2
        
        // Create an account with 0 wei and 4 FF as code
        PUSH13 0x63FFFFFFFF60005260046000F3
        PUSH1 0
        MSTORE
        PUSH1 2
        PUSH1 13
        PUSH1 0
        PUSH1 0
        CREATE2      
      `,
      gasCost: null, // TODO
      stack: null,
      sender: new Address('9bbfed6889322e016e0a02ee459d306fc19545d8'),
      validation: (evm) => {
        const stack = evm.stack;
        const network = evm.network;
        expect(stack.length).toBe(4);
        expect(network.contracts.length).toBe(3);
      },
    },
    {
      name: 'CREATE',
      script: `
        PUSH17 0x67600054600757FE5B60005260086018F3
        PUSH1 0
        MSTORE
        PUSH1 17
        PUSH1 15
        PUSH1 0
        CREATE
      `,
      gasCost: null,
      memory:
        '00000000000000000000000000000067600054600757fe5b60005260086018f3',
      stack: null,
    },
  ];

  const singleCase: EvmTestCaseOptions[] = evmTestCases.filter(
    (item) => item.only
  );

  it.each<EvmTestCaseOptions>(singleCase.length ? singleCase : evmTestCases)(
    'Test of opcodes $name',
    async (options) => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: options.script,
      });
      await evm
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender: options.sender || sender,
            receiver: new Address(),
            gasLimit: options.gasLimit || gasLimit,
            value: options.value || new Wei(new BigNumber(16)),
            data: options.calldata || Buffer.alloc(0),
          },
        })
        .execute();

      if (options.gasCost !== null) {
        expect(evm.totalGasCost).toBe(options.gasCost);
      }

      if (options.memory) {
        expect(evm.memory.raw.toString('hex')).toBe(options.memory);
      }

      if (options.stack) {
        expect(evm.stack.toString()).toBe(options.stack.toString());
      }

      if (options.validation) {
        options.validation(evm);
      }
    }
  );

  it('should not only run one opcode test', async () => {
    if (singleCase.length) {
      throw new Error('Enable all opcode tests :)');
    }
  });
});

interface EvmTestCaseOptions {
  name: string;
  script: string;
  gasCost: number | null;
  calldata?: Buffer;
  gasLimit?: BigNumber;
  stack: Array<number | Address | BigNumber> | null;
  memory?: string;
  sender?: Address;
  validation?: (evm: ExposedEvm) => void;
  only?: boolean;
  value?: Wei;
}
