import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { Address } from '../Address';
import { Evm } from '../Evm';
import { MnemonicParser } from '../MnemonicParser';
import { Wei } from '../Wei';

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
            value: new Wei(16),
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
            value: new Wei(16),
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
            value: new Wei(16),
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
          value: new Wei(16),
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
            value: new Wei(16),
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
            value: new Wei(16),
            data: Buffer.alloc(0),
          },
        })
        .execute();
      expect(evm.totalGasCost).toBe(23706);
    });
  });
});
