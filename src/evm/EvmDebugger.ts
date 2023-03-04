import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { Evm } from './Evm';
import { ExposedEvm } from './ExposedEvm';
import { GasKeys } from './gas/GasKeys';
import { EvmContext } from './interfaceEvm';
import { OpcodeLookups } from './Opcodes';

@injectable()
export class EvmDebugger {
  private currentGasUsage: Partial<Record<GasKeys, number>> = {};
  private previousGasUsage: Partial<Record<GasKeys, number>> = {};

  constructor(private logger: Logger) {}

  public tick() {
    this.previousGasUsage = {
      ...this.currentGasUsage,
    };
    this.currentGasUsage = {};
  }

  public writeGasUsage({ key, value }: { key: GasKeys; value: number }) {
    this.currentGasUsage[key] = value;
  }

  public printState({ evmContext }: { evmContext: EvmContext | ExposedEvm }) {
    const evm = 'evm' in evmContext ? evmContext.evm : evmContext;
    const state = [
      `Is sub context ? : ${evm.isSubContext}`,
      `PC: ${evm.pc.toString()} / 0x${evm.pc.toString(16)}`,
      `Opcode: ${this.getOpcode({ evm })?.mnemonic}`,
      `Memory: ${evm.memory.raw.toString('hex')}`,
      `Stack items : ${evm.stack.length}`,
    ];

    const gasState = this.getKasKeys({
      name: 'Gas usage: ',
      keyValue: this.currentGasUsage,
    });
    const previousGasState = this.getKasKeys({
      name: 'Previous gas usage: ',
      keyValue: this.previousGasUsage,
    });

    this.logger.log(
      [...state, '\n', ...gasState, '\n', ...previousGasState].join('\n')
    );
  }

  private getOpcode({ evm }: { evm: Evm }) {
    if (evm.pc < evm.program.length) {
      return OpcodeLookups[evm.program[evm.pc]];
    } else if (evm.previousPc < evm.program.length) {
      return OpcodeLookups[evm.program[evm.previousPc]];
    }
  }

  private getKasKeys({
    keyValue,
    name,
  }: {
    name: string;
    keyValue: Partial<Record<GasKeys, number>>;
  }): string[] {
    const entries = [...Object.entries(keyValue)];
    if (!entries.length) {
      return [];
    }
    return [name, ...entries.map(([key, value]) => `${key} : ${value}`)];
  }
}
