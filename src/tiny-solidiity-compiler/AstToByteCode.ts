/*
Just some thoughts, implementation over the next few days
- Need to construct a jump table
    - We start with a simple empty contract
    - Then add one function
- I think we should try to match the solc compiler output, at least use it for reference.

- I think we can create small macros of evm code, and map that to functions.

*/

import { injectable } from 'inversify';
import { isTemplateExpression } from 'typescript';
import { GetRandomBytesInteractor } from '../network/nonce-generator/GetRandomBytesInteractor';
import { getBufferFromHex } from '../utils';
import { EvmByteCodeMacros } from './EvmBytecodeMacros';
import { EvmProgram } from './EvmProgram';
import { Parser } from './Parser';

@injectable()
export class AstToByteCode {
  constructor(
    private parser: Parser,
    private evmProgram: EvmProgram,
    private evmByteCodeMacros: EvmByteCodeMacros
  ) {}

  public deployment({ script }: { script: string }): Buffer {
    const program = this.evmProgram.buildProgram();

    program.operation((item) => item.allocateMemory());
    program.operation((item) => item.nonPayable());
    program.operation((item, size) => {
      return item.jumpi(() => item.simpleRevert(), size);
    });
    // Pop of the payment value
    //  program.operation((item) => item.pop());
    program.operation((item, size) => {
      // cheating, but this should just be the output contract.
      // currently looking at deployment
      const program = getBufferFromHex(
        '0x6080604052600080fdfea264697066735822122062b37c2f49de67be4e4e8d8e912267eeef2505297138bd257fd40fe4e97a2d1064736f6c634300080f0033'
      );
      return item.codeCopyReturn({
        program,
        destination: 0,
        offset: size,
        size: program.length,
      });
    });

    return program.output;
  }
}
