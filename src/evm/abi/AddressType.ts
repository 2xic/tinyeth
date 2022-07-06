import { StringEncoderDecoder } from '../../rlp/types/StringEncoderDecoder';
import { EncodingResults } from '../../rlp/types/TypeEncoderDecoder';
import { getBufferFromHex } from '../../utils/getBufferFromHex';

export class AddressType {
  constructor(private address: string) {}

  public get value(): EncodingResults {
    const encoding = getBufferFromHex(this.address)
      .toString('hex')
      .padStart(64, '0');
    return {
      encoding,
      length: 0,
    };
  }

  public get type(): string {
    // This has to be dynamic.
    throw new Error('Not implemented');
  }

  public get isDynamic(): boolean {
    return false;
  }
}
