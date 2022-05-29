import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { RlpEncoder } from '../../rlp/RlpEncoder';
import { MerklePatriciaTrie } from './MerklePatriciaTrie';

// Test from https://medium.com/@chiqing/merkle-patricia-trie-explained-ae3ac6a7e123
describe.skip('MerklePatriciaTrie', () => {
  it('should correctly get the hash of a basic root node', () => {
    const trie = new MerklePatriciaTrie();
    trie.put(
      Buffer.from('010102', 'hex'),
      Buffer.from(
        new RlpEncoder()
          .encode({
            input: ['hello'],
          })
          .slice(2),
        'hex'
      )
    );
    expect(trie.root.key.toString('hex')).toBe('20010102');
    expect(trie.rootHash).toBe(
      '4a5b19d151e796482b08a1e020f1f7ef5ea7240c0171fd629598fee612892a7b'
    );
  });

  it('should correctly get the hash of a trie with a extension node', () => {
    const trie = new MerklePatriciaTrie();
    trie.put(
      Buffer.from('010102', 'hex'),
      getBufferFromHex(
        new RlpEncoder().encode({
          input: ['hello'],
        })
      )
    );
    trie.put(
      Buffer.from('01010255', 'hex'),
      getBufferFromHex(
        new RlpEncoder().encode({
          input: ['hellothere'],
        })
      )
    );
    expect(trie.root.rawKey.toString('hex')).toBe('00010102');
    expect(trie.root.rawValue.toString('hex')).toBe(
      'dc6e2b9778d3bec8fcd3764f8fed3b66ca0b46f4b97c907239efc9fc0e13ca3a'
    );
    expect(trie.rootHash).toBe(
      'b47e5f20cadaf505f1fe660a45def89d80eb04213549f6bb04f57d6c2e8fc479'
    );
  });

  it('should correctly construct a trie when a rlp encoding of child nodes if less than 32 bytes', () => {
    const trie = new MerklePatriciaTrie();
    const value1 = getBufferFromHex(
      new RlpEncoder().encode({
        input: '1',
      })
    );
    trie.put(Buffer.from('01', 'hex'), value1);
    expect(value1[0]).toBe(49);
    const value2 = getBufferFromHex(
      new RlpEncoder().encode({
        input: '2',
      })
    );
    expect(value2[0]).toBe(50);
    trie.put(Buffer.from('01020304', 'hex'), value2);
    expect(trie.rootHash).toBe(
      '3d299c699d2493544988846e0031a413208e84f5f219c8c7d8975078324f6338'
    );
  });

  it('should correctly construct a trie with an extension node', () => {
    const trie = new MerklePatriciaTrie();
    const value1 = getBufferFromHex(
      new RlpEncoder().encode({
        input: '1',
      })
    );
    trie.put(Buffer.from('01', 'hex'), value1);
    expect(value1[0]).toBe(49);
    const value2 = getBufferFromHex(
      new RlpEncoder().encode({
        input: '2',
      })
    );
    expect(value2[0]).toBe(50);
    trie.put(Buffer.from('01020304', 'hex'), value2);
    expect(trie.root.childrenValues.length).toBe(17);

    const value3 = getBufferFromHex(
      new RlpEncoder().encode({
        input: '3',
      })
    );
    expect(value3[0]).toBe(51);

    trie.put(Buffer.from('01020305', 'hex'), value3);
    expect(trie.rootHash).toBe(
      'c3ec460706a96826f0d4a352d862fae09f992938978bceff805cc4601a61c9e1'
    );
  });

  it('should correctly update the hash when the keys are changed', () => {
    const trie = new MerklePatriciaTrie();

    trie.put(
      Buffer.from('010102', 'hex'),
      getBufferFromHex(
        new RlpEncoder().encode({
          input: ['hello'],
        })
      )
    );

    const hash1 = trie.rootHash;

    trie.put(
      Buffer.from('01010255', 'hex'),
      getBufferFromHex(
        new RlpEncoder().encode({
          input: ['hellothere'],
        })
      )
    );

    const hash2 = trie.rootHash;

    expect(hash1).not.toBe(hash2);
  });
});
