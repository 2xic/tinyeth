import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { Evm } from '../Evm';
import { MnemonicParser } from '../MnemonicParser';
import { Wei } from '../Wei';

describe('EvmGas', () => {
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
        .boot(contract, {
          nonce: 1,
          value: new Wei(16),
          data: Buffer.from('0001', 'hex'),
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
        .boot(contract, {
          nonce: 1,
          value: new Wei(16),
          data: Buffer.from('0001', 'hex'),
        })
        .execute();
      // memory is on now hot!
      evm
        .boot(contract, {
          nonce: 1,
          value: new Wei(16),
          data: Buffer.from('0001', 'hex'),
        })
        .execute();
      expect(evm.totalGasCost).toBe(23226);
    });
  });
});
