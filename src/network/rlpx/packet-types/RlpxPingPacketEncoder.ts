import { RlpEncoder } from '../../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { RlpxPacketTypes } from './RlpxMessageDecoder';

export function GetRlpxPingPacketEncoded() {
  return Buffer.concat([
    getBufferFromHex(new RlpEncoder().encode({ input: RlpxPacketTypes.PING })),
    getBufferFromHex(new RlpEncoder().encode({ input: [] })),
  ]);
}
