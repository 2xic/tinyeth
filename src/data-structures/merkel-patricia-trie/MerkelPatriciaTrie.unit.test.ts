import { RewriteMerklePatriciaTrie } from './MerkelPatriciaTrie';
import { BranchNode } from './nodes/BranchNode';
import { ExtensionNode } from './nodes/ExstensionNode';
import { LeafNode } from './nodes/LeafNode';
import { Node, NodeType } from './nodes/Node';

describe('MerklePatriciaTrie', () => {
  it('should correctly update the root node from empty node to leaf node', () => {
    const interactor = new RewriteMerklePatriciaTrie();
    expect(interactor.trieRoot.type).toBe(NodeType.EMPTY_NODE);
    interactor.insert('dog', 'verb');
    expect(interactor.trieRoot.type).toBe(NodeType.LEAF_NODE);

    const value = interactor.traverse('dog');
    expect(value).toBe('verb');
  });

  it('should correctly update the root node from empty node to leaf node to branch node', () => {
    const interactor = new RewriteMerklePatriciaTrie();
    expect(interactor.trieRoot.type).toBe(NodeType.EMPTY_NODE);
    interactor.insert('do', 'verb');
    expect(interactor.trieRoot.type).toBe(NodeType.LEAF_NODE);

    interactor.insert('dog', 'puppy');
    expect(interactor.trieRoot.type).toBe(NodeType.EXTENSION_NODE);

    const doValue = interactor.traverse('do');
    expect(doValue).toBe('verb');

    const dogValue = interactor.traverse('dog');
    expect(dogValue).toBe('puppy');
  });

  it('should correctly adjust an extension node ', () => {
    const interactor = new RewriteMerklePatriciaTrie();
    expect(interactor.trieRoot.type).toBe(NodeType.EMPTY_NODE);
    interactor.insert('do', 'verb');

    expect(interactor.trieRoot.type).toBe(NodeType.LEAF_NODE);

    interactor.insert('dog', 'puppy');
    expect(interactor.trieRoot.type).toBe(NodeType.EXTENSION_NODE);

    //  -> should now readjust the extension node value
    /**
     * <64 6f> : 'verb'
     * <64 6f 67> : 'puppy'
     * Trie:
     *  Extension node : [0x646f, branchNode]
     *  Branch node      [  [67, leafNode]   'verb']
     *
     * <68 6f 72 73 65> : 'stallion'
     *  Trie update
     *    Need to split up the extension node
     *      [0x6, branchNode]
     *    BranchNode
     *      [The same prefix is still true for the extension node]
     *      <- remove the prefix that is new the extension node
     *      <- use the new key as a key in the branch node
     *      <- insert the modified extension node into the branch
     *    <- The key for the other node will then be added as a leaf node
     */
    interactor.insert('horse', 'stallion');
    expect(interactor.trieRoot.type).toBe(NodeType.EXTENSION_NODE);

    expect(interactor.trieRoot.type).toBe(NodeType.EXTENSION_NODE);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, value] = interactor.trieRoot.rawValues;

    const branchNodeReference = interactor.retrieveNode({ hash: value });
    expect(branchNodeReference.type).toBe(NodeType.BRANCH_NODE);
    expect(
      branchNodeReference.rawValues[branchNodeReference.rawValues.length - 1]
        .length
    ).toBe(0);
    const branchNodeExtensionReference = interactor.retrieveNode({
      hash: branchNodeReference.rawValues[4],
    });
    expect(branchNodeExtensionReference.type).toBe(NodeType.EXTENSION_NODE);
    expect(
      (branchNodeExtensionReference as ExtensionNode).key.toString('hex')
    ).toBe('060f');
    const branchNodeExtensionLeaf = interactor.retrieveNode({
      hash: branchNodeReference.rawValues[8],
    });
    expect(branchNodeExtensionLeaf.type).toBe(NodeType.LEAF_NODE);

    const doValue = interactor.traverse('do');
    expect(doValue).toBe('verb');

    const dogValue = interactor.traverse('dog');
    expect(dogValue).toBe('puppy');

    const horseValue = interactor.traverse('horse');
    expect(horseValue).toBe('stallion');
  });

  it('should correctly create same tree layout as on the wiki when all keys are added', () => {
    const interactor = new RewriteMerklePatriciaTrie();
    expect(interactor.trieRoot.type).toBe(NodeType.EMPTY_NODE);
    interactor.insert('do', 'verb');
    interactor.insert('dog', 'puppy');
    interactor.insert('doge', 'coin');
    interactor.insert('horse', 'stallion');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, value] = interactor.trieRoot.rawValues;
    expect(interactor.trieRoot.type).toBe(NodeType.EXTENSION_NODE);

    const branchNodeReference = interactor.retrieveNode({
      hash: value,
    }) as BranchNode;
    expect(branchNodeReference.type).toBe(NodeType.BRANCH_NODE);
    expect(branchNodeReference.rawValues[4]).toBeTruthy();
    expect(branchNodeReference.rawValues[8]).toBeTruthy();
    const otherValues = branchNodeReference.rawValues;
    otherValues[4] = Buffer.alloc(0);
    otherValues[8] = Buffer.alloc(0);
    expect(otherValues.map((item) => item.toString('hex')).join('')).toBe('');

    /**
     * Slot 8
     */
    const slot8 = interactor.retrieveNode({
      hash: branchNodeReference.rawValues[8],
    }) as LeafNode;
    expect(slot8.type).toBe(NodeType.LEAF_NODE);

    /*
      Slot 4
    */
    const slot4 = interactor.retrieveNode({
      hash: branchNodeReference.rawValues[4],
    }) as ExtensionNode;
    expect(slot4.type).toBe(NodeType.EXTENSION_NODE);

    /**
      Extension references
    */
    const branchExtensionReferences = interactor.retrieveNode({
      hash: (slot4 as ExtensionNode).value,
    }) as BranchNode;
    expect(branchExtensionReferences.type).toBe(NodeType.BRANCH_NODE);
    expect(branchExtensionReferences.value.toString('ascii')).toBe('verb');
    expect(branchExtensionReferences.rawValues[6]).toBeTruthy();

    /**
     * Slot 6
     */
    const otherValuesSlot6 = branchExtensionReferences.rawValues;
    otherValuesSlot6[6] = Buffer.alloc(0);
    otherValuesSlot6[16] = Buffer.alloc(0);
    expect(otherValuesSlot6.map((item) => item.toString('hex')).join('')).toBe(
      ''
    );

    const slot6 = interactor.retrieveNode({
      hash: branchExtensionReferences.rawValues[6],
    }) as ExtensionNode;
    expect(slot6.type).toBe(NodeType.EXTENSION_NODE);

    const slot6BranchNode = interactor.retrieveNode({
      hash: slot6.value,
    }) as BranchNode;
    expect(slot6BranchNode.type).toBe(NodeType.BRANCH_NODE);
    expect(slot6BranchNode.value.toString('utf8')).toBe('puppy');

    const otherValuesSlot6BranchNode = slot6BranchNode.rawValues;
    otherValuesSlot6BranchNode[6] = Buffer.alloc(0);
    otherValuesSlot6BranchNode[16] = Buffer.alloc(0);
    expect(
      otherValuesSlot6BranchNode.map((item) => item.toString('hex')).join('')
    ).toBe('');

    const coinSlot = interactor.retrieveNode({
      hash: slot6BranchNode.rawValues[6],
    }) as BranchNode;
    expect(coinSlot.type).toBe(NodeType.LEAF_NODE);
    expect(coinSlot.value.toString('utf8')).toBe('coin');
  });
});
