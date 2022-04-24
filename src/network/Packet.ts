import { RlpDecoder } from '../rlp/RlpDecoder';
import { keccak256 } from './keccak256';
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

export class Packet {
  public decodeHello({ input }: { input: Buffer }): ParsedHelloPacket {
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

export enum PacketTypes {
  PING = 1,
  PONG = 2,
  FIND_NODE = 3,
  NEIGHBORS = 4,
  UNKNOWN,
}

interface ParsedHelloPacket {
  version: number;
  userAgent: string | number;
}

interface ParsedPacket {
  packetType: PacketTypes;
}

type DecodedPacketTypes =
  | PingPacket
  | PongPacket
  | FindNodePacket
  | NeighborsPacket;
