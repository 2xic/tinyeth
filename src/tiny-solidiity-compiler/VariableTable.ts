export class VariableTable {
  private variable: Record<string, string> = {};

  private variableMetadata: Record<string, Metadata> = {};

  public add({ name, metadata }: { name: string; metadata: Metadata }) {
    this.variable[name] = this.variable.length;
    this.variableMetadata[name] = metadata;
  }

  public getSlot({ name }: { name: string }) {
    // TODO: it should not be stored in a slot.
    //      Use a stack like a sane person would
    return this.variable[name];
  }
}

type Metadata = InlineMetadata | FunctionMetadata;

interface InlineMetadata {
  location: 'inline';
}

interface FunctionMetadata {
  location: 'function';
  offset: number;
}
