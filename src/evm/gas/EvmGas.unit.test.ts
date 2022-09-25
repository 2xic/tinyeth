import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { Address } from '../Address';
import { Evm } from '../Evm';
import { MnemonicParser } from '../MnemonicParser';
import { Wei } from '../eth-units/Wei';
import { getBufferFromHex } from '../../utils';
import { ExposedEvm } from '../ExposedEvm';

describe('EvmGas', () => {
  const sender = new Address();
  const gasLimit = new BigNumber(0xffffff);

  describe('intrinsic Gas', () => {
    it('should add base cost', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: '',
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(21000);
    });

    it('should add zero memory cost', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: '',
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.alloc(4, 0),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(21016);
    });

    it('should add non-zero memory cost', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: '',
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.alloc(4, 1),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(21064);
    });

    it('should add combined zero and non-zero memory cost', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: '',
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.concat([Buffer.alloc(4, 1), Buffer.alloc(4, 0)]),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(21080);
    });
  });

  describe('sload', () => {
    it('should correctly execute a cold sload', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            PUSH1 0x01
            PUSH1 0x00
            SSTORE 
            PUSH1 0x00
            SLOAD 
            PUSH1 0x0c
            JUMPI 
            INVALID 
            JUMPDEST        
          `,
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(43223);
    });

    it('should correctly warm a key on sload', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            PUSH1 0x00
            SLOAD
            PUSH1 0x00
            SLOAD
          `,
      });
      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            gasLimit,
            sender,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(23206);
    });
  });

  describe('sstore', () => {
    it('should correctly compute the gas cost of SSTORE', async () => {
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
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(43126);
    });

    it('should correctly compute the gas cost of warm SSTORE', async () => {
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
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      expect(evm.gasCost()).toBe(43126);

      expect(Object.entries(evm.storage.storage).length).toBe(1);

      // memory is on now hot!
      await evm
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.from('0001', 'hex'),
          },
        })
        .execute();
      // I think this is correct, since we assume it's in the same execution
      expect(evm.gasCost()).toBe(21126);
    });

    it('should correctly warm the slot on sload then sstore', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
                PUSH1 0
                SLOAD

                PUSH2 0xFFFF
                PUSH1 0
                SSTORE
            `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(43109);
    });

    it('should correctly compute gas cost of updating a value', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            PUSH2 0xFFFF
            PUSH1 0
            SSTORE
            
            PUSH2 0xFF
            PUSH1 0
            SSTORE
            `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(43212);
    });

    it('should correctly compute gas cost of updating from zero to non zero value', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            // Example 1
            PUSH2 0
            PUSH1 0
            SSTORE
            
            // Example 2
            PUSH2 0xFF
            PUSH1 0
            SSTORE        
          `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(43212);
    });

    it('should correctly compute gas cost of updating from zero to zero value', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            // Example 1
            PUSH2 0
            PUSH1 0
            SSTORE
            
            // Example 2
            PUSH2 0
            PUSH1 0
            SSTORE     
          `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23312);
    });

    it('should correctly compute gas cost of updating from zero to one to zero value', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
        script: `
            // consume gas
            PUSH2 0
            PUSH1 0
            SSTORE

            // consume gas
            PUSH2 0xFF
            PUSH1 0
            SSTORE

            // gas will be refunded
            PUSH2 0
            PUSH1 0
            SSTORE     
          `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(34655);
    });
  });

  describe('mstore8', () => {
    it('should compute mstore8 correctly', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#53
      const contract = mnemonicParser.parse({
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
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21021);
    });
  });

  describe('MSTORE', () => {
    it('should compute mstore correctly', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
            PUSH1 0xFF
            PUSH1 0
            MSTORE
          `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21012);
    });

    it('should compute mstore correctly', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
            PUSH13 0x63FFFFFFFF6000526004601CF3
            PUSH1 0
            MSTORE
          `,
      });
      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21012);
    });
  });

  describe('Access sets', () => {
    it('should correctly calculate cold access', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#55
      const contract = mnemonicParser.parse({
        script: `
            PUSH32 0xdeadbeef
            BALANCE
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23603);
    });

    it('should correctly calculate hot access', async () => {
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(16)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23706);
    });
  });

  describe('CallDataCopy', () => {
    it('example 1 single copy', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#37
      const contract = mnemonicParser.parse({
        script: `
        // Example 1
        PUSH1 32
        PUSH1 0
        PUSH1 0
        CALLDATACOPY
      `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: getBufferFromHex(
              '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
            ),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21530);
    });

    it('example 2 single copy', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#37
      const contract = mnemonicParser.parse({
        script: `
        // Example 2
        PUSH1 8
        PUSH1 31
        PUSH1 0
        CALLDATACOPY      `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: getBufferFromHex(
              '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
            ),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21530);
    });

    it('example 2 double copy', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#37
      const contract = mnemonicParser.parse({
        script: `
        // Example 2
        PUSH1 8
        PUSH1 31
        PUSH1 0
        CALLDATACOPY      
        
        PUSH1 8
        PUSH1 31
        PUSH1 0
        CALLDATACOPY      
        `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: getBufferFromHex(
              '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
            ),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21545);
    });

    it('double copy', async () => {
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

      const evm = await getClassFromTestContainer(ExposedEvm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: getBufferFromHex(
              '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
            ),
          },
        })
        .execute();
      expect(evm.memory.raw.toString('hex')).toBe(
        'ff00000000000000ffffffffffffffffffffffffffffffffffffffffffffffff'
      );
      expect(evm.totalGasCost).toBe(21545);
    });
  });

  describe('codecopy', () => {
    it('should compute opcodes until gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
            // Put the beginning of the code to the expected value
            PUSH30 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
            PUSH32 0
            
            // Remove the values from the stack
            POP
            POP
            
            // Example 1
            PUSH1 32
            PUSH1 0
            PUSH1 0
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21019);
    });

    it('should compute codecopy gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
            // Put the beginning of the code to the expected value
            PUSH30 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
            PUSH32 0
            
            // Remove the values from the stack
            POP
            POP
            
            // Example 1
            PUSH1 32
            PUSH1 0
            PUSH1 0
            CODECOPY
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(21028);
    });
  });

  describe('create', () => {
    it('should compute large mstore gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      const contract = mnemonicParser.parse({
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
        `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(59451);
    });
    it('should compute create gas cost', async () => {
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(117039);
    });

    it('should compute create gas cost from mstore', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `          
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(53021);
    });

    it('should compute two empty contracts and prepare the last contract', async () => {
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
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(85039);
    });

    it('should compute the simplest create gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
          // Create an account with 0 wei and no code
          PUSH1 0
          PUSH1 0
          PUSH1 0
          CREATE
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(53009);
    });

    it('should compute the simplest create with wei gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
            // Create an account with 9 wei and no code
            PUSH1 0
            PUSH1 0
            PUSH1 9
            CREATE
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(53009);
    });

    it('should compute the simplest create gas cost', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
          // Create an account with 0 wei and no code
          PUSH1 0
          PUSH1 0
          PUSH1 0
          CREATE
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(9)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(53009);
    });

    it('simple create', async () => {
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(54645);
    });

    it('create from store', async () => {
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
        `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(54639);
    });

    it('create two empty contracts', async () => {
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
        `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(85018);
    });
  });

  describe('call', () => {
    it('should execute correctly everything but delegatecall', async () => {
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
          `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(54657);
    });

    it('delegatecall zero gas', async () => {
      const mnemonicParser = new MnemonicParser();
      // Example from https://www.evm.codes/#F4
      const contract = mnemonicParser.parse({
        script: `
          PUSH1 0
          PUSH1 0
          MSTORE
          PUSH1 0
          PUSH1 0
          PUSH1 0
          CREATE
          
          // Call with storage slot 0 = 0, returns 0
          PUSH1 0
          PUSH1 0
          PUSH1 0
          PUSH1 0
          DUP5
          PUSH2 0x0
          DELEGATECALL      
        `,
      });

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(53139);
    });

    it('single delegatecall', async () => {
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(120292);
    });

    it('double delegatecall', async () => {
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

      const evm = await getClassFromTestContainer(Evm)
        .boot({
          program: contract,
          context: {
            nonce: 1,
            sender,
            gasLimit,
            receiver: new Address(),
            value: new Wei(new BigNumber(0)),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(142633);
    });
  });
});
