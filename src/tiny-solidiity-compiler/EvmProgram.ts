import { injectable } from 'inversify';
import { EvmByteCodeMacros } from './EvmBytecodeMacros';

@injectable()
export class EvmProgram {
  constructor(private evmByteCodeMacros: EvmByteCodeMacros) {}

  public buildProgram() {
    return new EvmProgramBuilder(this.evmByteCodeMacros);
  }
}

class EvmProgramBuilder {
  private program: Buffer = Buffer.alloc(0);

  constructor(private evmByteCodeMacros: EvmByteCodeMacros) {}

  public operation(
    macroOperation: (item: EvmByteCodeMacros, size: number) => Buffer
  ) {
    this.program = Buffer.concat([
      this.program,
      macroOperation(this.evmByteCodeMacros, this.program.length),
    ]);
  }

  public get output() {
    return this.program;
  }
}
