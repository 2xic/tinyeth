import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils';
import { keccak256 } from '../../../utils/keccak256';
import { InMemoryDatabase } from '../../utils/InMemoryDatabase';

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
    return getBufferFromHex(keccak256(this.nodeValue));
  }

  public get nodeValue() {
    return getBufferFromHex(
      new RlpEncoder().encode({
        input: this.rawValues,
      })
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
