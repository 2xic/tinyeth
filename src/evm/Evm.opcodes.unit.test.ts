import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { ExposedEvm } from './ExposedEvm';
import { MnemonicParser } from './MnemonicParser';
import { Wei } from './Wei';

/*
    The test mnemonic code here is are all from https://www.evm.codes/
    They have great examples :) 
*/
describe('evm.codes', () => {
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

  it('should correctly execute DIV', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 0].toString());
  });

  it.skip('should correctly execute SDIV', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 2].toString());
  });

  it('should correctly execute MOD', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21022);
    expect(evm.stack.toString()).toBe([1, 2].toString());
  });

  it('should correctly execute MULMOD', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.totalGasCost).toBe(21034);
    expect(evm.stack.toString()).toBe([4, 9].toString());
  });

  it('should correctly execute EXP', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([100, 4].toString());
    expect(evm.totalGasCost).toBe(21132);
  });

  it('should correctly execute LT', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute GT', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it.skip('should correctly execute SGT', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it.skip('should correctly execute SLT', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it.skip('should correctly execute SGT', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([1, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute AND', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([0xf, 0].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it('should correctly execute OR', () => {
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
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe([0xff, 0xff].toString());
    expect(evm.totalGasCost).toBe(21018);
  });

  it.each<{
    name: string;
    script: string;
    gasCost: number;
    stack: Array<number | BigNumber>;
  }>([
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
    /*
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
    */
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
    /** TODO: Fix -> There is a bug in the contract deployment logic */
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
  ])('Test of opcodes', (options) => {
    const mnemonicParser = new MnemonicParser();
    const contract = mnemonicParser.parse({
      script: options.script,
    });
    const evm = getClassFromTestContainer(ExposedEvm)
      .boot(contract, {
        nonce: 1,
        value: new Wei(16),
        data: Buffer.from('', 'hex'),
      })
      .execute();
    expect(evm.stack.toString()).toBe(options.stack.toString());
    expect(evm.totalGasCost).toBe(options.gasCost);
  });
});
