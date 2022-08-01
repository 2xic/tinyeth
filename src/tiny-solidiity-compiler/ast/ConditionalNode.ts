import { FieldNode } from './FieldNode';
import { VariableNode } from './VariableNode';

export class ConditionalNode extends FieldNode<ConditionalNodeFields> {
  constructor(public fieldValues: Record<string, string>) {
    super(fieldValues);
  }
}

interface ConditionalNodeFields {
  // Could be an array
  conditional: VariableNode;
}
