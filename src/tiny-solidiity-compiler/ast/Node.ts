export class Node {
  constructor(private rawValue: string) {}

  private children: Node[] = [];

  public add(node: Node) {
    this.children.push(node);
  }

  public get nodes() {
    return this.children;
  }

  public get value() {
    return this.rawValue;
  }
}
