import { RlpEncoder } from '../../rlp/RlpEncoder';
import { addTerminator, removeTerminator } from './terminatorUtils';
import { convertBytesToNibbles } from './convertBytesToNibbles';
import { packNibbles } from './packNibbles';
import { getBufferFromHex } from '../../network/getBufferFromHex';
import { TrieNode } from './TrieNode';
import { TrieNodeReference } from './TrieNodeReference';
import { sha3_256 } from '../../network/sha3_256';
import { unpackNibbles } from './unpackNibbles';

export class MerklePatriciaTrieHelper {
  public encodeNode({ key, value }: { key: Buffer; value: Buffer }) {
    const rlpEncoding = new RlpEncoder().encode({
      input: [key, value],
    });
    if (rlpEncoding.length < 32) {
      return new TrieNode({
        key,
        value,
      });
    }
    return new TrieNodeReference(sha3_256(getBufferFromHex(rlpEncoding)));
  }

  public encodeNodeChildren(
    children: Array<string | Buffer | Array<string | Buffer>>
  ) {
    const data = new RlpEncoder().encode({
      input: children,
    });
    return sha3_256(getBufferFromHex(data));
  }

  public encodeKeyAndValue({
    key: inputKey,
    value,
    skipConverting,
  }: {
    key: Buffer;
    value: Buffer;
    skipConverting?: boolean;
  }) {
    const key = skipConverting
      ? inputKey
      : this.convertKey({
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

  public recoverKey({ input }: { input: Buffer }) {
    return unpackNibbles(removeTerminator(input));
  }

  public commonPrefixLength({ key1, key2 }: { key1: Buffer; key2: Buffer }) {
    const length = Math.min(key1.length, key2.length);
    let commonPrefix = 0;
    for (let i = 0; i < length; i++) {
      if (key1[i] != key2[i]) {
        break;
      }
      commonPrefix++;
    }
    const type = this.getCommonPrefixResultType({
      key1,
      key2,
      commonPrefix,
    });

    return {
      length: commonPrefix,
      type,
    };
  }

  private getCommonPrefixResultType({
    key1,
    key2,
    commonPrefix,
  }: {
    key1: Buffer;
    key2: Buffer;
    commonPrefix: number;
  }) {
    if (Buffer.compare(key1, key2) === 0) {
      return CommonPrefixResultType.EQUAL;
    } else if (key1.length < commonPrefix) {
      return CommonPrefixResultType.KEY1_EXHAUSTED;
    }
  }
}

export enum CommonPrefixResultType {
  EQUAL,
  KEY1_EXHAUSTED,
}
