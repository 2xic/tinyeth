import { MnemonicParser } from './MnemonicParser';

describe('MnemonicParser', () => {
  it('should correctly parse from mnemonic to bytecode', () => {
    [['PUSH1 1'], ['PUSH1 0x1 ']].map((mnemonics) => {
      const parser = new MnemonicParser().parse({
        mnemonics,
      });
      expect(Buffer.compare(parser, Buffer.from('6001', 'hex'))).toBe(0);
    });
  });

  it('should ignore comments', () => {
    [[' // xxx ']].map((mnemonics) => {
      const parser = new MnemonicParser().parse({
        mnemonics,
      });
      expect(Buffer.compare(parser, Buffer.from('', 'hex'))).toBe(0);
    });
  });

  it('should not ignore opcode if comment is after', () => {
    const parser = new MnemonicParser().parse({
      mnemonics: ['PUSH1 0x1 // xxx '],
    });
    expect(Buffer.compare(parser, Buffer.from('6001', 'hex'))).toBe(0);
  });

  it('should correctly parse from mnemonic to bytecode', () => {
    // ADD opcode example from https://www.evm.codes/
    const script = `
    // Example 1
    PUSH1 10
    PUSH1 10
    ADD
    
    // Example 2
    PUSH32 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    PUSH1 1
    ADD
    `;
    const parser = new MnemonicParser().parse({
      script: script,
    });
    expect(
      Buffer.compare(
        parser,
        Buffer.from(
          '600a600a017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600101',
          'hex'
        )
      )
    ).toBe(0);
  });
});
