import { GetRlpxPingPacketEncoded } from './RlpxPingPacketEncoder';
import { describe, it, expect } from '../../../getActiveTestMetadata';

describe('RlpxPingPacketEncoder', () => {
  it('should encode correctly', () => {
    expect(GetRlpxPingPacketEncoded().toString('hex')).toBe('02c0');
  });
});
