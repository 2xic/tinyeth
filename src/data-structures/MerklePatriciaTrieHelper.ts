import { RlpEncoder } from '../rlp/RlpEncoder';
import { addTerminator } from './addTerminator';
import { convertBytesToNibbles } from './convertBytesToNibbles';
import { packNibbles } from './packNibbles';

export class MerklePatriciaTrieHelper {
  public encodeKeyAndValue({
    key: inputKey,
    value,
  }: {
    key: Buffer;
    value: Buffer;
  }) {
    const key = this.convertKey({
      input: inputKey,
    });
    const data = new RlpEncoder().encode({
      input: [key, value],
    });
    return data;
  }

  public convertKey({ input }: { input: Buffer }) {
    return packNibbles(addTerminator(convertBytesToNibbles(input)));
  }
}
