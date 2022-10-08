import { buf } from 'crc-32/*';
import { RlpEncoder } from '../../../rlp';
import { getBufferFromHex } from '../../../utils';
import { sha3_256 } from '../../../utils/sha3_256';
import { Node, NodeType } from './Node';

export class BranchNode implements Node {
  private children: Array<Buffer | number> = [...new Array(17)];

  constructor(
    private options: {
      key: Buffer;
      value: Buffer;
    }
  ) {
    this.children = this.children.map(() => 0);
    this.children[this.children.length - 1] = options.value;
  }

  public insert(index: number, node: Buffer, overwrite = false) {
    if (this.children[index] && !overwrite) {
      throw new Error(`you overwrite a key at index ${index}, are you sure ?`);
    }
    this.children[index] = node;
  }

  public get nodeKey() {
    return sha3_256(this.nodeValue);
  }

  public get nodeValue() {
    return getBufferFromHex(
      new RlpEncoder().encode({
        input: this.children,
      })
    );
  }

  public get value() {
    return this.options.value;
  }

  public get(index: number): Buffer | null {
    if (index < 0 || index > 15) {
      throw new Error('out of range');
    }
    const value = this.children[index];
    if (!value || typeof value == 'number') {
      return null;
    }
    return value;
  }

  public get type(): NodeType {
    return NodeType.BRANCH_NODE;
  }

  public get rawValues(): Buffer[] {
    return this.children.map((item) => {
      if (typeof item === 'number') {
        return Buffer.alloc(0);
      } else {
        return item;
      }
    });
  }
}
