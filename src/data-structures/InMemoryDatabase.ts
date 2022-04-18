import { keccak256 } from '../network/keccak256';

export class InMemoryDatabase {
  private storage: Record<string, string> = {};

  public save(key: string, value: string) {
    this.storage[keccak256(Buffer.from(key, 'ascii')).toString('hex')] = value;
  }

  public retrieve(key: string) {
    return this.storage[keccak256(Buffer.from(key, 'ascii')).toString('hex')];
  }
}
