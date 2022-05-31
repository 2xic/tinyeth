import { GetRlpxPingPacketEncoded } from './RlpxPingPacketEncoder';

describe('RlpxPingPacketEncoder', () => {
  it('should encode correctly', () => {
    expect(GetRlpxPingPacketEncoded().toString('hex')).toBe('02c0');
  });
});
