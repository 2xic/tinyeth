import { RlpEncoder } from '../../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { sha3_256 } from '../../../utils/sha3_256';
import { Node, NodeType } from './Node';

export class ExtensionNode implements Node {
  constructor(private options: { key: Buffer; value: Buffer }) {}

  public get type(): NodeType {
    return NodeType.EXTENSION_NODE;
  }

  public get key(): Buffer {
    return this.options.key;
  }

  public get value(): Buffer {
    return this.options.value;
  }

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

  public get rawValues(): Buffer[] {
    return [this.key, this.options.value];
  }
}
