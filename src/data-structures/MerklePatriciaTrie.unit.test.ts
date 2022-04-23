import { getBufferFromHex } from '../network/getBufferFromHex';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { MerklePatriciaTrie } from './MerklePatriciaTrie';

// Test from https://medium.com/@chiqing/merkle-patricia-trie-explained-ae3ac6a7e123
describe('MerkelPatriciaTrie', () => {
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

  it.skip('should get the value if it exists', () => {
    const trie = new MerklePatriciaTrie();
    trie.put(Buffer.from([1, 2, 3, 4]), Buffer.from('hello', 'ascii'));

    const results = trie.get(Buffer.from([1, 2, 3, 4]));
    expect(results.found).toBe(true);
    expect(results.value?.toString('ascii')).toBe('hello');
  });

  it.skip('should correctly update the tree', () => {
    const trie = new MerklePatriciaTrie();

    trie.put(Buffer.from([1, 2, 3, 4]), Buffer.from('hello', 'ascii'));
    trie.put(Buffer.from([1, 2, 3, 4]), Buffer.from('world', 'ascii'));

    const results = trie.get(Buffer.from([1, 2, 3, 4]));
    expect(results.found).toBe(true);
    expect(results.value?.toString('ascii')).toBe('world');
  });

  it.skip('should correctly update the hash when the keys are changed', () => {
    const trie = new MerklePatriciaTrie();

    // trie.put(Buffer.from([1, 2, 3, 4]), Buffer.from('hello', 'ascii'));

    const hash1 = trie.hash;

    // trie.put(Buffer.from([1, 2, 3, 4]), Buffer.from('world', 'ascii'));

    const hash2 = trie.hash;

    expect(hash1).not.toBe(hash2);
  });
});
