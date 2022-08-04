import { FieldNode } from './FieldNode';

export class VariableNode extends FieldNode<Variable> {
  constructor(protected input: Record<string, string>) {
    super(input);
  }
}

interface Variable {
  name: string;
  type: string;
  value: string;
  access: string;
}
