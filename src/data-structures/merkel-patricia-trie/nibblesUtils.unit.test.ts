import { packNibbles } from './packNibbles';
import { addTerminator } from './terminatorUtils';

describe('nibblesUtils', () => {
  it('should encode and decode correctly', () => {
    const results = packNibbles(addTerminator(Buffer.from([5])));
    expect(results.toString('hex')).toBe('35');
  });
});
