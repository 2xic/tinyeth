import { MnemonicParser } from './MnemonicParser';
import { describe, it, expect } from '../getActiveTestMetadata';

describe('MnemonicParser', () => {
  it('should correctly parse from mnemonic to bytecode', () => {
    [['PUSH1 1'], ['PUSH1 0x1 ']].map((mnemonics) => {
      const parser = new MnemonicParser().parse({
        mnemonics,
      });
      expect(Buffer.compare(parser, Buffer.from('6001', 'hex'))).toBe(0);
    });
  });

  it('should correctly parse opcodes with variable length with unmatched argument length', () => {
    const parser = new MnemonicParser().parse({
      mnemonics: ['PUSH32 0xdeadbeef'],
    });
    expect(parser.length).toBe(33);
  });

  it('should ignore comments', () => {
    [[' // xxx ']].map((mnemonics) => {
      const parser = new MnemonicParser().parse({
        mnemonics,
      });
      expect(Buffer.compare(parser, Buffer.from('', 'hex'))).toBe(0);
    });
  });

  it('should correctly encode a non hex number ', () => {
    const parser = new MnemonicParser().parse({
      mnemonics: ['PUSH3 21000'],
    });
    expect(Buffer.compare(parser, Buffer.from('62005208', 'hex'))).toBe(0);
  });

  it('should not ignore opcode if comment is after', () => {
    const parser = new MnemonicParser().parse({
      mnemonics: ['PUSH1 0x1 // xxx '],
    });
    expect(Buffer.compare(parser, Buffer.from('6001', 'hex'))).toBe(0);
  });

  it('should correctly parse script to bytecode', () => {
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

  it('should correctly parse script to bytecode', () => {
    // ADD opcode example from https://www.evm.codes/
    const script = `
      PUSH17 0x67600054600757FE5B60005260086018F3
    `;
    const parser = new MnemonicParser().parse({
      script: script,
    });

    expect(parser.length).toBe(18);
  });
});
