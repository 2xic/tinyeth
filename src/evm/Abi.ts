import { keccak256 } from '../network/keccak256';
import { Uint } from '../rlp/types/Uint';

export class Abi {
  public encodeFunction(name: string): string {
    return keccak256(Buffer.from(name, 'ascii')).slice(0, 4).toString('hex');
  }

  public encodeFunctionWithSignature(name: string, data: Uint): string {
    const functionEncoded = this.encodeFunction(name);

    const dataEncoded = data.value.encoding;

    return `${functionEncoded}${dataEncoded}`;
  }
}
