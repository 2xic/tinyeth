import { FieldNode } from './FieldNode';

export class VariableNode extends FieldNode {
  constructor(protected fieldsValue: Record<string, string>) {
    super(fieldsValue);
  }
}
