import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils';
import { sha3_256 } from '../../../utils/sha3_256';
import { Node, NodeType } from './Node';

export class LeafNode implements Node {
  constructor(private options: { key: Buffer; value: Buffer }) {}

  public get nodeKey() {
    return sha3_256(this.nodeValue);
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

  public get type(): NodeType {
    return NodeType.LEAF_NODE;
  }

  public get rawValues(): Buffer[] {
    return [this.key, this.options.value];
  }
}
