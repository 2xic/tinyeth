import { RlpDecoder } from '../rlp/RlpDecoder';
import { keccak256 } from '../utils/keccak256';
import {
  FindNodePacket,
  FindNodePacketEncodeDecode,
} from './packet-types/FindNodePacketEncodeDecode';
import {
  NeighborsPacket,
  NeighborsPacketEncodeDecode,
} from './packet-types/NeighborsPacketEncodeDecode';
import { PacketEncodeDecode } from './packet-types/PacketEncodeDecode';
import {
  PingPacket,
  PingPacketEncodeDecode,
} from './packet-types/PingPacketEncodeDecode';
import {
  PongPacket,
  PongPacketEncodeDecode,
} from './packet-types/PongPacketEncodeDecode';
import {
  HelloPacketEncoderDecoder,
  ParsedHelloPacket,
} from './packet-types/HelloPacketEncoderDecoer';

export class Packet {
  public parse({ packet }: { packet: Buffer }) {
    const packetId = packet[0];
    // falsy values are parsed as 0x80 in RLP
    let parsedPacketId = packetId === 0x80 ? 0 : packetId;
    parsedPacketId =
      parsedPacketId === 16 ? RlpxPacketTypes.PING : parsedPacketId;

    if (parsedPacketId === RlpxPacketTypes.HELLO) {
      return this.decodeHello({ input: packet });
    } else if (parsedPacketId === RlpxPacketTypes.DISCONNECT) {
      console.log(new RlpDecoder().decode({ input: packet.toString('hex') }));
      throw new Error('Disconnect ?');
    } else if (parsedPacketId === RlpxPacketTypes.PING) {
      return RlpxPacketTypes.PONG;
    } else if (parsedPacketId === RlpxPacketTypes.PONG) {
      return RlpxPacketTypes.PING;
    } else {
      throw new Error(`Unknown packet (${parsedPacketId})`);
    }
  }

  public encodePing(_input: PingPacket): string {
    return new PingPacketEncodeDecode().encode({ input: _input });
  }

  public decodeHello({ input }: { input: Buffer }): ParsedHelloPacket {
    return new HelloPacketEncoderDecoder().decode({ input });
  }

  public encodeHello({ packet }: { packet: ParsedHelloPacket }) {
    return new HelloPacketEncoderDecoder().encode({ input: packet });
  }

  public decodePing({
    input,
  }: {
    input: Buffer;
  }): ParsedPacket & DecodedPacketTypes {
    const verification = keccak256(input.slice(32));
    const messageHash = input.slice(0, 32);
    if (Buffer.compare(verification, messageHash) !== 0) {
      throw new Error('Packet is invalid');
    }
    const metadata = input.slice(97);
    const typeNumber = metadata[0];
    const packetType = this.getPacketType(typeNumber);

    const data = new RlpDecoder().decode({
      input: metadata.slice(1).toString('hex'),
      returnOnError: true,
    });
    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }
    const packetDecoder: Partial<
      Record<PacketTypes, PacketEncodeDecode<DecodedPacketTypes>>
    > = {};
    packetDecoder[PacketTypes.PING] = new PingPacketEncodeDecode();
    packetDecoder[PacketTypes.PONG] = new PongPacketEncodeDecode();
    packetDecoder[PacketTypes.FIND_NODE] = new FindNodePacketEncodeDecode();
    packetDecoder[PacketTypes.NEIGHBORS] = new NeighborsPacketEncodeDecode();

    const results = packetDecoder[packetType]?.decode({
      input: data,
    });

    if (!results) {
      throw new Error('Missing packet encoder / decoder');
    }

    return {
      packetType,
      ...results,
    };
  }

  private getPacketType(typeNumber: number): PacketTypes {
    const types = [
      PacketTypes.PING,
      PacketTypes.PONG,
      PacketTypes.FIND_NODE,
      PacketTypes.NEIGHBORS,
    ];
    for (const type of types) {
      if (type === typeNumber) {
        return type;
      }
    }
    return PacketTypes.UNKNOWN;
  }
}

export enum RlpxPacketTypes {
  HELLO = 0x0,
  DISCONNECT = 0x1,
  PING = 0x2,
  PONG = 0x3,
}

// https://github.com/ethereum/devp2p/blob/master/discv4.md#ping-packet-0x01
export enum PacketTypes {
  PING = 1,
  PONG = 2,
  FIND_NODE = 3,
  NEIGHBORS = 4,
  UNKNOWN,
}

interface ParsedPacket {
  packetType: PacketTypes;
}

type DecodedPacketTypes =
  | PingPacket
  | PongPacket
  | FindNodePacket
  | NeighborsPacket;
