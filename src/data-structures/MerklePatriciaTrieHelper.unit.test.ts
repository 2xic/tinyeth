import { getBufferFromHex } from '../network/getBufferFromHex';
import { RlpEncoder } from '../rlp/RlpEncoder';
import {
  CommonPrefixResultType,
  MerklePatriciaTrieHelper as MerklePatriciaTrieHelper,
} from './MerklePatriciaTrieHelper';
import { singleHexDigitString } from './singleHexDigitString';

describe('MerklePatriciaTrieHelper', () => {
  it('should correctly encode key and value', () => {
    const value = getBufferFromHex(
      new RlpEncoder().encode({
        input: ['hello'],
      })
    );
    const key = Buffer.from('010102', 'hex');
    const data = new MerklePatriciaTrieHelper().encodeKeyAndValue({
      key,
      value,
    });
    expect(data).toBe('0xcd842001010287c68568656c6c6f');
  });

  it('should correctly convert a key', () => {
    const key = new MerklePatriciaTrieHelper().convertKey({
      input: Buffer.from('010102', 'hex'),
    });
    expect(key.toString('hex')).toBe('20010102');
  });

  it('should correctly recover a converted key', () => {
    const key = new MerklePatriciaTrieHelper().recoverKey({
      input: Buffer.from('20010102', 'hex'),
    });
    expect(singleHexDigitString(key)).toBe('010102');
  });

  it('should correctly find the length of the common prefix', () => {
    const commonPrefixResult =
      new MerklePatriciaTrieHelper().commonPrefixLength({
        key1: Buffer.from('test', 'ascii'),
        key2: Buffer.from('teppe', 'ascii'),
      });
    expect(commonPrefixResult.length).toBe(2);
    expect(commonPrefixResult.type).toBe(undefined);
  });

  it('should correctly find the length of the common prefix', () => {
    const commonPrefixResult =
      new MerklePatriciaTrieHelper().commonPrefixLength({
        key1: Buffer.from('test', 'ascii'),
        key2: Buffer.from('test', 'ascii'),
      });
    expect(commonPrefixResult.length).toBe(4);
    expect(commonPrefixResult.type).toBe(CommonPrefixResultType.EQUAL);
  });
});
