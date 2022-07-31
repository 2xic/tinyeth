import { FieldNode } from './FieldNode';

export class FunctionNode extends FieldNode<FunctionNodeFields> {
  constructor(public fieldValues: Record<string, string>) {
    super(fieldValues);
  }
}

interface FunctionNodeFields {
  name: string;
  payable: boolean;
  modifier: string;
}
