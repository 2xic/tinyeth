import { CommonPrefixResultType } from '../deprecated-old/MerklePatriciaTrieHelper';

export class GetCommonPrefixResult {
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
      prefix: key1.slice(0, commonPrefix),
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
    } else if (key2.length < commonPrefix) {
      return CommonPrefixResultType.KEY2_EXHAUSTED;
    } else if (key2.length == commonPrefix) {
      return CommonPrefixResultType.KEY2_PREFIX;
    } else if (key1.length == commonPrefix) {
      return CommonPrefixResultType.KEY1_PREFIX;
    } else if (commonPrefix === 0) {
      return CommonPrefixResultType.NO_PREFIX;
    }
  }
}
