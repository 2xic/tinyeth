import { FieldNode } from './FieldNode';

export class ReturnNode extends FieldNode {
  constructor(protected fieldValues: Record<string, string>) {
    super(fieldValues);
  }

  public get isValue(): boolean {
    return /^\d+$/.test(this.fields.value);
  }
}
