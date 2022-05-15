import { KeyPair } from '../signatures/KeyPair';
import { P2P } from './P2P';

describe('P2P', () => {
  it('should parse an enocde', () => {
    const enode =
      'enode://000070a0abc214c4b89b84f294d32d3ee32a26a8ac56f0ac9d9bb7c34e022faa14e7f9a6f72e09b5f224ed9a18c974ac424e87ffcef98c1e029df4b2908d24fd@3.124.103.13:30303';
    const results = new P2P(new KeyPair()).parseEncode(enode);

    expect(results.address).toBe('3.124.103.13');
    expect(results.port).toBe(30303);
  });
});
