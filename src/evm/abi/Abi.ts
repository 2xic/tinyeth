import { keccak256 } from '../../utils/keccak256';
import { Uint } from '../../rlp/types/Uint';
import { AbiStruct } from './AbiStruct';

export class Abi {
  public encodeFunction(name: string): string {
    return keccak256(Buffer.from(name, 'ascii')).slice(0, 4).toString('hex');
  }

  public encodeFunctionWithSignature(
    name: string,
    data: Uint | AbiStruct
  ): string {
    const functionEncoded = this.encodeFunction(name);

    const dataEncoded = data.value.encoding;

    return `${functionEncoded}${dataEncoded}`;
  }

  public simpleFunctionEncoding(options: {
    functionName: string;
    arguments: AbiStruct | Uint;
  }) {
    const functionCall = `${options.functionName}(${options.arguments.type})`;

    const functionEncoded = this.encodeFunction(functionCall);

    const dataEncoded = options.arguments.value.encoding;

    return `${functionEncoded}${dataEncoded}`;
  }
}
