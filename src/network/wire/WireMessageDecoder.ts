import { RlpDecoder } from '../../rlp/RlpDecoder';
import { keccak256 } from '../../utils/keccak256';
import {
  FindNodePacket,
  FindNodePacketEncodeDecode,
} from '../wire/FindNodePacketEncodeDecode';
import {
  NeighborsPacket,
  NeighborsPacketEncodeDecode,
} from '../wire/NeighborsPacketEncodeDecode';
import { PacketEncodeDecode } from '../wire/PacketEncodeDecode';
import {
  PingPacket,
  PingPacketEncodeDecode,
} from '../wire/PingPacketEncodeDecode';
import {
  PongPacket,
  PongPacketEncodeDecode,
} from '../wire/PongPacketEncodeDecode';
import { injectable } from 'inversify';

@injectable()
export class WireMessageDecoder {
  constructor(
    private pingPacketEncodeDecode: PingPacketEncodeDecode,
    private pongPacketEncodeDecode: PongPacketEncodeDecode,
    private findNodePacketEncodeDecode: FindNodePacketEncodeDecode,
    private neighborsPacketEncodeDecode: NeighborsPacketEncodeDecode
  ) {}

  public decode({
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
    const packet = metadata.slice(1);

    const data = new RlpDecoder().decode({
      input: packet.toString('hex'),
    });

    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }
    const packetDecoder: Partial<
      Record<WirePacketTypes, PacketEncodeDecode<DecodedPacketTypes>>
    > = {};
    packetDecoder[WirePacketTypes.PING] = this.pingPacketEncodeDecode;
    packetDecoder[WirePacketTypes.PONG] = this.pongPacketEncodeDecode;
    packetDecoder[WirePacketTypes.FIND_NODE] = this.findNodePacketEncodeDecode;
    packetDecoder[WirePacketTypes.NEIGHBORS] = this.neighborsPacketEncodeDecode;

    const results = packetDecoder[packetType]?.decode({
      input: data,
    });

    if (!results) {
      throw new Error('Missing packet encoder / decoder');
    }

    return {
      packetType,
      messageHash,
      ...results,
    };
  }

  private getPacketType(typeNumber: number): WirePacketTypes {
    const types = [
      WirePacketTypes.PING,
      WirePacketTypes.PONG,
      WirePacketTypes.FIND_NODE,
      WirePacketTypes.NEIGHBORS,
    ];
    for (const type of types) {
      if (type === typeNumber) {
        return type;
      }
    }
    return WirePacketTypes.UNKNOWN;
  }
}

interface ParsedPacket {
  packetType: WirePacketTypes;
  messageHash: Buffer;
}

type DecodedPacketTypes =
  | PingPacket
  | PongPacket
  | FindNodePacket
  | NeighborsPacket;

// https://github.com/ethereum/devp2p/blob/master/discv4.md#ping-packet-0x01
export enum WirePacketTypes {
  PING = 1,
  PONG = 2,
  FIND_NODE = 3,
  NEIGHBORS = 4,
  UNKNOWN,
}
