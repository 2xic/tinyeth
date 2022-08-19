import { Merkle } from './Merkle';
import { List } from './types/List';
import { Uint } from './types/Uint';

describe('Merkel', () => {
  it('should create a merkel tree', () => {
    // used example from https://ethereum.stackexchange.com/questions/74005/what-is-ssz-simpleserialize-and-why-was-it-developed
    const output = new Merkle().merklize([
      new Uint(64, 42),
      new List<Uint>([new Uint(8, 0), new Uint(8, 1), new Uint(8, 2)]),
      new Uint(64, 43),
    ]);
    expect(output.shift()?.length).toBe(2);
    expect(output.shift()?.length).toBe(4);
    expect(output.shift()?.length).toBe(2);
    expect(output.shift()?.length).toBe(1);
  });
});
