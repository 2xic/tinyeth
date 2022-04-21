import { getBufferFromHex } from '../network/getBufferFromHex';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { MerklePatriciaTrieHelper as MerklePatriciaTrieHelper } from './MerklePatriciaTrieHelper';

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
});
