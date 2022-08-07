import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { Address } from '../Address';
import { Evm } from '../Evm';
import { MnemonicParser } from '../MnemonicParser';
import { Wei } from '../eth-units/Wei';
import { getBufferFromHex } from '../../utils';

describe('EvmGas', () => {
  const sender = new Address();
  const gasLimit = new BigNumber(0xffffff);

  describe('sstore', () => {
    it('should correctly compute the gas cost of SSTORE', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
                // Example 1
                PUSH2 0xFFFF
                PUSH1 0
                SSTORE
            `,
      });
      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(43126);
    });

    it('should correctly compute the gas cost of warm SSTORE', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
                // Example 1
                PUSH2 0xFFFF
                PUSH1 0
                SSTORE
            `,
      });
      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      // memory is on now hot!
      evm
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23226);
    });
  });

  describe('MSTORE', () => {
    const mnemonicParser = new MnemonicParser();
    // Example from https://www.evm.codes/#55
    const contract = mnemonicParser.parse({
      script: `
            PUSH1 0xFF
            PUSH1 0
            MSTORE
          `,
    });
    const evm = getClassFromTestContainer(Evm)
      .boot({
        program: contract,
        context: {
          nonce: 1,
          sender,
          gasLimit,
          value: new Wei(new BigNumber(16)),
          data: Buffer.alloc(0),
        },
      })
      .execute();
    expect(evm.totalGasCost).toBe(21012);
  });

  describe('Access sets', () => {
    it('should correctly calculate cold access', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
            PUSH32 0xdeadbeef
            BALANCE
          `,
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23603);
    });

    it('should correctly calculate hot access', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
            PUSH32 0xdeadbeef
            BALANCE

            PUSH32 0xdeadbeef
            BALANCE
            `,
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23706);
    });
  });

  describe('calldatacopy', () => {
    it('copy', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#37
      const contract = mnemonicParser.parse({
        script: `
        // Example 1
        PUSH1 32
        PUSH1 0
        PUSH1 0
        CALLDATACOPY
        
        // Example 2
        PUSH1 8
        PUSH1 31
        PUSH1 0
        CALLDATACOPY
      `,
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(0)),
            data: getBufferFromHex(
              '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
            ),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21545);
    });
  });

  describe('create', () => {
    it('should compute create gas cost', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
          // Create an account with 0 wei and no code
          PUSH1 0
          PUSH1 0
          PUSH1 0
          CREATE
          
          // Create an account with 9 wei and no code
          PUSH1 0
          PUSH1 0
          PUSH1 9
          CREATE
          
          // Create an account with 0 wei and 4 FF as code
          PUSH13 0x63FFFFFFFF6000526004601CF3
          PUSH1 0
          MSTORE
          PUSH1 13
          PUSH1 0
          PUSH1 0
          CREATE 
          `,
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(117039);
    });

    it('simple create', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
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
        `,
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(54645);
    });
  });

  describe('call', () => {
    it('simple delegatecall', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
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

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(120292);
    });

    it('delegatecall', () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
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
      });

      const evm = getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(142633);
    });
  });
});
