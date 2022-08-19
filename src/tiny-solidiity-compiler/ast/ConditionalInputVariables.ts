import { FieldNode } from './FieldNode';

export class ConditionalInputVariables extends FieldNode<Variable> {
  constructor(protected input: Record<string, string>) {
    super(input);
  }

  public variables(): string[] {
    if ('variable' in this.fieldValues) {
      return [this.fieldValues.variable].filter(
        (item) => !this.isStaticVariable(item)
      );
    } else {
      return [this.fieldValues.variable1, this.fieldValues.variable2].filter(
        (item) => !this.isStaticVariable(item)
      );
    }
  }

  public getVariables() {
    if ('variable' in this.fields) {
      return {
        variable1: this.fieldValues.variable,
        variable2: undefined,
        operator: undefined,
      };
    } else {
      return {
        variable1: this.fields.variable1,
        variable2: this.fields.variable2,
        operator: this.fields.operator,
      };
    }
  }

  private isStaticVariable(input: string) {
    return this.isNumber(input) || input === 'true';
  }

  private isNumber(input: string) {
    return /^\d+$/.test(input);
  }
}

type Variable =
  | {
      variable1: string;
      variable2: string;
      operator: string;
    }
  | {
      variable: string;
    };
