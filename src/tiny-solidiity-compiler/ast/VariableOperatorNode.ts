import { FieldNode } from './FieldNode';

export class VariableOperatorNode extends FieldNode<Variable> {
  constructor(protected input: Record<string, string>) {
    super(input);
  }
}

interface Variable {
  name: string;
  operator: string;
  value: string;
}
