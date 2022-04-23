import { TrieNode } from './TrieNode';

describe('TrieNode', () => {
  it('should initialize the correct number of child', () => {
    const trie = new TrieNode();
    trie.seedEmptyNodes();
    expect(trie.childrenValues.length).toBe(16);
  });
});
