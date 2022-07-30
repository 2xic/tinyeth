import { FieldNode } from './FieldNode';

export class ContractNode extends FieldNode<ContractNodeFields> {
  constructor(protected fieldValues: Record<string, string>) {
    super(fieldValues);
  }
}

interface ContractNodeFields {
  name: string;
}
