export class InMemoryDatabase {
  private storage: Record<string, Buffer> = {};

  public insert({ key, value }: { key: Buffer; value: Buffer }) {
    this.storage[key.toString('hex')] = value;
  }

  public retrieve(key: Buffer) {
    const results = this.storage[key.toString('hex')];

    if (!results) {
      throw new Error(`${key.toString('hex')} not found in db`);
    }

    return results;
  }
}
