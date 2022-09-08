import { keccak256 } from '../../utils/keccak256';
import { Uint } from '../../rlp/types/Uint';
import { AbiStructEncoder } from './AbiStructEncoder';

export class Abi {
  public encodeFunction(name: string): string {
    return keccak256(Buffer.from(name, 'ascii')).slice(0, 4).toString('hex');
  }

  /*
  public encodeFunctionArguments({
    name,
    functionArguments,
  }: {
    name: string;
    functionArguments?: FunctionTypes[];
  }): string {
    return this.encodeFunction(`${name}(${functionArguments?.join(',')})`);
  }
  */

  public encodeFunctionWithSignature(
    name: string,
    data: Uint | AbiStructEncoder
  ): string {
    const functionEncoded = this.encodeFunction(name);

    const dataEncoded = data.value.encoding;

    return `${functionEncoded}${dataEncoded}`;
  }

  public simpleFunctionEncoding(options: {
    functionName: string;
    arguments: AbiStructEncoder | Uint;
  }) {
    const functionCall = `${options.functionName}(${options.arguments.type})`;

    const functionEncoded = this.encodeFunction(functionCall);

    const dataEncoded = options.arguments.value.encoding;

    return `${functionEncoded}${dataEncoded}`;
  }

  public encodeArguments(options: { arguments: AbiStructEncoder }) {
    return options.arguments.encoding;
  }
}

export type FunctionTypes = 'uint8';
