export class SyntaxContext {
  constructor(public context: Context) {}

  public get tokenValue() {
    return this.context.tokens[
      this.context.currentIndex + this.context.movedIndex
    ];
  }

  public get errorContext(): string {
    return this.context.tokens
      .slice(this.context.currentIndex, this.context.currentIndex + 5)
      .join(' ');
  }

  public get sumIndex(): number {
    return this.context.currentIndex + this.context.movedIndex;
  }
}

export interface Context {
  tokens: string[];
  currentIndex: number;
  variableScopes: Record<string, string[]>;
  fieldValues: Record<string, string>;
  movedIndex: number;
}
