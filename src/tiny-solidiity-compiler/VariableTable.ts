export class VariableTable {
  private variable: Record<string, string> = {};

  public add({ name }: { name: string }) {
    this.variable[name] = this.variable.length;
  }

  public getSlot({ name }: { name: string }) {
    return this.variable[name];
  }
}
