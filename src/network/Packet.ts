import { RlpDecoder } from '../rlp/RlpDecoder';

export class Packet {
  public decode({ input }: { input: Buffer }): ParsedPacket {
    const data = new RlpDecoder().decode({ input: input.toString('hex') });
    if (!Array.isArray(data)) {
      throw new Error('Something is wrong');
    }
    const [_length, client, version, _authLength, pubKey, _x, _y, _z] = data;
    if (typeof client !== 'string') {
      throw new Error(
        'Error while decoding packet, expected client host to be a string'
      );
    }
    if (!Array.isArray(version)) {
      throw new Error('Expected version to be part of a list');
    }
    if (!Array.isArray(version[1])) {
      throw new Error('Expected version to be part of a list');
    }

    if (typeof version[1][1] !== 'number') {
      throw new Error('Expected version to be part of a list');
    }

    return {
      userAgent: client,
      version: version[1][1],
    };
  }
}

interface ParsedPacket {
  version: number;
  userAgent: string | number;
}
