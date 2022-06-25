import { injectable } from 'inversify';
import {
  ParsedHelloPacket,
  RlpxHelloPacketEncoderDecoder,
} from './RlpxHelloPacketEncoderDecoder';

@injectable()
export class RlpxMessageDecoder {
  constructor(private helloPacketDecoder: RlpxHelloPacketEncoderDecoder) {}

  public decode({ packet }: { packet: Buffer }):
    | {
        packet: RlpxPacketTypes.HELLO;
        data: ParsedHelloPacket;
      }
    | {
        packet: RlpxPacketTypes.DISCONNECT;
        data: {
          reason: string;
        };
      }
    | {
        packet: RlpxPacketTypes.PING | RlpxPacketTypes.PONG;
      } {
    const packetId = packet[0];
    const packetPayload = packet.slice(1);
    // falsy values are parsed as 0x80 in RLP
    let parsedPacketId = packetId === 0x80 ? 0 : packetId;
    parsedPacketId =
      parsedPacketId === 16 ? RlpxPacketTypes.PING : parsedPacketId;

    if (parsedPacketId === RlpxPacketTypes.HELLO) {
      return {
        packet: RlpxPacketTypes.HELLO,
        data: this.helloPacketDecoder.decode({ input: packetPayload }),
      };
    } else if (parsedPacketId === RlpxPacketTypes.DISCONNECT) {
      const reason: Record<number, string> = {
        0x00: 'Disconnect requested',
        0x01: 'TCP sub-system error',
        0x02: 'Breach of protocol, e.g. a malformed message, bad RLP, ...',
        0x03: 'Useless peer', // hm. I got this one once.
        0x04: 'Too many peers', // hm. I got this one also.
        0x05: 'Already connected',
        0x06: 'Incompatible P2P protocol version',
        0x07: 'Null node identity received - this is automatically invalid',
        0x08: 'Client quitting',
        0x09: 'Unexpected identity in handshake',
        0x0a: 'Identity is the same as this node (i.e. connected to itself)',
        0x0b: 'Ping timeout',
        0x10: 'Some other reason specific to a subprotocol',
      };
      if (packet.length == 3) {
        const index = packet[packet.length - 1];
        return {
          packet: RlpxPacketTypes.DISCONNECT,
          data: {
            reason: reason[index],
          },
        };
      }
      return {
        packet: RlpxPacketTypes.DISCONNECT,
        data: {
          reason: 'Unknown',
        },
      };
    } else if (parsedPacketId === RlpxPacketTypes.PING) {
      return {
        packet: RlpxPacketTypes.PING,
      };
    } else if (parsedPacketId === RlpxPacketTypes.PONG) {
      return {
        packet: RlpxPacketTypes.PONG,
      };
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
