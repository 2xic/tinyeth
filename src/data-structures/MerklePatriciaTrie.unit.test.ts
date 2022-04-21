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
    expect(trie.rootHash).toBe(
      '15da97c42b7ed2e1c0c8dab6a6d7e3d9dc0a75580bbc4f1f29c33996d1415dcc'
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
