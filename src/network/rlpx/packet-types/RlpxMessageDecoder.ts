import { injectable } from 'inversify';
import { RlpxHelloPacketEncoderDecoder } from './RlpxHelloPacketEncoderDecoder';

@injectable()
export class RlpxMessageDecoder {
  constructor(private helloPacketDecoder: RlpxHelloPacketEncoderDecoder) {}

  public decode({ packet }: { packet: Buffer }) {
    const packetId = packet[0];
    const packetPayload = packet.slice(1);
    // falsy values are parsed as 0x80 in RLP
    let parsedPacketId = packetId === 0x80 ? 0 : packetId;
    parsedPacketId =
      parsedPacketId === 16 ? RlpxPacketTypes.PING : parsedPacketId;

    if (parsedPacketId === RlpxPacketTypes.HELLO) {
      return this.helloPacketDecoder.decode({ input: packetPayload });
    } else if (parsedPacketId === RlpxPacketTypes.DISCONNECT) {
      throw new Error('Disconnect ?');
    } else if (parsedPacketId === RlpxPacketTypes.PING) {
      return RlpxPacketTypes.PONG;
    } else if (parsedPacketId === RlpxPacketTypes.PONG) {
      return RlpxPacketTypes.PING;
    } else {
      throw new Error(`Unknown packet (${parsedPacketId})`);
    }
  }
}

export enum RlpxPacketTypes {
  HELLO = 0x0,
  DISCONNECT = 0x1,
  PING = 0x2,
  PONG = 0x3,
}
