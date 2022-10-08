import { RlpDecoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils';
import { InMemoryDatabase } from '../../utils/InMemoryDatabase';
import { BranchNode } from './BranchNode';
import { ExtensionNode } from './ExstensionNode';
import { LeafNode } from './LeafNode';
import { Node } from './Node';

export function convertRlpNodeToNode({
  key,
  value,
  inMemoryDatabase,
}: {
  key: Buffer;
  value: Buffer;
  inMemoryDatabase: InMemoryDatabase;
}): Node {
  //  console.log(value);
  const output = new RlpDecoder().decode({ input: value.toString('hex') });

  if (Array.isArray(output) && output.length === 17) {
    let nodeValue = output[output.length - 1];
    nodeValue =
      typeof nodeValue == 'string' ? Buffer.from(nodeValue, 'ascii') : '';

    if (!Buffer.isBuffer(nodeValue)) {
      //throw new Error('hm?');
      nodeValue = Buffer.alloc(0);
    }
    const branchNode = new BranchNode({
      key,
      value: nodeValue,
    });

    output.slice(0, output.length - 1).forEach((item, index) => {
      if (item && typeof item === 'string') {
        /*const node = convertRlpNodeToNode({
          key: Buffer.alloc(0),
          value: inMemoryDatabase.retrieve(getBufferFromHex(item)),
          inMemoryDatabase,
        });
        */
        branchNode.insert(index, getBufferFromHex(item));
        /*
        console.log(item);
        console.log());
        throw new Error('insert not implemented');
        */
      } else if (item) {
        throw new Error('unknown type ser');
      }
    });

    return branchNode;
  } else if (Array.isArray(output) && output.length == 2) {
    // Leaf node / extension node is dependent on the key value
    // assume leaf node for now ?

    let [key, value] = output;

    key = typeof key === 'string' ? getBufferFromHex(key) : Buffer.alloc(0);
    value = typeof value === 'string' ? Buffer.from(value) : Buffer.alloc(0);

    console.log({
      key,
      value: value.length,
    });

    // TODO: Implement the prefix key logic
    if (value.toString('utf-8').startsWith('0x')) {
      const node = new ExtensionNode({
        key,
        value: getBufferFromHex(value.toString('utf-8')),
      });

      return node;
    } else {
      const node = new LeafNode({
        key,
        value,
      });

      return node;
    }
  }

  throw new Error('not complemented');
}
