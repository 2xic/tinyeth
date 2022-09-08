import { FunctionTypes } from '../../evm';
import { FieldNode } from './FieldNode';

export class FunctionInputVariables extends FieldNode<Variable> {
  constructor(protected input: Record<string, string>) {
    super(input);
  }

  public getVariables() {
    return {
      variable: this.fieldValues.variable,
    };
  }
}

type Variable = {
  variable: FunctionTypes;
};
