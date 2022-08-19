import { SimpleSerialize } from './SimpleSerialize';
import { List } from './types/List';
import { Uint } from './types/Uint';

describe('SimpleSerialize', () => {
  it('should serialize simple example', () => {
    // used example from https://ethereum.stackexchange.com/questions/74005/what-is-ssz-simpleserialize-and-why-was-it-developed
    const example = {
      id: new Uint(64, 42),
      bytes: new List<Uint>([new Uint(8, 0), new Uint(8, 1), new Uint(8, 2)]),
      next: new Uint(64, 43),
    };
    const output = new SimpleSerialize().encoding(example);
    const expected = Buffer.from([
      42, 0, 0, 0, 12, 0, 0, 0, 43, 0, 0, 0, 0, 1, 2,
    ]);
    expect(output.toString('hex')).toBe(expected.toString('hex'));
  });
});
