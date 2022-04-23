export class InMemoryDatabase {
  private storage: Record<string, string> = {};

  public save(key: string, value: string) {
    this.storage[key] = value;
  }

  public retrieve(key: string) {
    return this.storage[key];
  }
}
