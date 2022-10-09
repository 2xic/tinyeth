import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils';
import { keccak256 } from '../../../utils/keccak256';
import { InMemoryDatabase } from '../../utils/InMemoryDatabase';
import { encodeNibbles } from '../utils/encodeNibbles';

export abstract class Node {
  constructor(protected options: { key: Buffer; value: Buffer }) {}

  public abstract get type(): NodeType;

  public abstract get rawValues(): Buffer[];

  public store(db: InMemoryDatabase) {
    db.insert({
      key: this.nodeKey,
      value: this.nodeValue,
    });
    return this;
  }

  public get nodeKey(): Buffer {
    if (this.nodeValue.length < 32) {
      return this.nodeValue;
    }
    return getBufferFromHex(keccak256(this.nodeValue));
  }

  public get nodeValue() {
    return getBufferFromHex(
      new RlpEncoder().encode({
        input: this.rawValues,
      })
    );
  }

  public get hash() {
    const input = [
      encodeNibbles({
        inputBytes: this.key,
        isLeaf: this.type === NodeType.LEAF_NODE,
      }),
      this.value,
    ];

    return keccak256(
      getBufferFromHex(
        new RlpEncoder().encode({
          input,
        })
      )
    );
  }

  public get key() {
    return this.options.key;
  }

  public get value() {
    return this.options.value;
  }
}

export enum NodeType {
  EMPTY_NODE = 'EMPTY_NODE',
  LEAF_NODE = 'LEAF_NODE',
  BRANCH_NODE = 'BRANCH_NODE',
  EXTENSION_NODE = 'EXTENSION_NODE',
}
