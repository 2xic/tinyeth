import { RlpDecoder } from '../rlp/RlpDecoder';

export class Packet {
  public decode({ input }: { input: Buffer }): ParsedPacket {
    const data = new RlpDecoder().decode({ input: input.toString('hex') });
    throw new Error('Code not implemented');
  }
}

interface ParsedPacket {
  version: number;
  userAgent: string;
}
