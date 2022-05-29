import { RlpDecoder } from '../rlp/RlpDecoder';
import { InputTypes, RlpEncoder } from '../rlp/RlpEncoder';
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
import { ReadOutRlp } from '../rlp/ReadOutRlp';
import ip6addr from 'ip6addr';
import { convertNumberToPadHex } from './convertNumberToPadHex';
import { getBufferFromHex } from './getBufferFromHex';

export class Packet {
  public parse({ packet }: { packet: Buffer }) {
    const packetId = packet[0];
    // falsy values are parsed as 0x80 in RLP
    const parsedPacketId = packetId === 0x80 ? 0 : packetId;
    if (parsedPacketId === PacketTypes.HELLO) {
      return this.decodeHello({ input: packet });
    } else {
      throw new Error(`Unknown packet (${parsedPacketId})`);
    }
  }

  public encodePing(_input: PingPacket): string {
    /*
      packet-data = [4, from, to, expiration, enr-seq ...]
      from = [sender-ip, sender-udp-port, sender-tcp-port]
      to = [recipient-ip, recipient-udp-port, 0]
    */
    const input: InputTypes = [
      0x4,
      [
        Buffer.from(ip6addr.parse(_input.fromIp).toBuffer().slice(-4)),
        Buffer.from(convertNumberToPadHex(_input.fromUdpPort), 'hex'),
        Buffer.from(convertNumberToPadHex(_input.fromTcpPort), 'hex'),
      ],
      [
        Buffer.from(ip6addr.parse(_input.toIp).toBuffer()),
        Buffer.from(convertNumberToPadHex(_input.toUdpPort), 'hex'),
        Buffer.from(convertNumberToPadHex(_input.toTcpPort), 'hex'),
      ],
      Buffer.from(convertNumberToPadHex(_input.expiration), 'hex'),
      ...(_input.sequence ? _input.sequence : []),
    ];

    return new RlpEncoder().encode({
      input,
    });
  }

  // TODO Moves this into an encoder / decoder class
  public decodeHello({ input }: { input: Buffer }): ParsedHelloPacket {
    const data = new RlpDecoder().decode({ input: input.toString('hex') });
    const rlpReader = new ReadOutRlp(data);
    // protocol version
    const [protocolVersion] = rlpReader.readArray<number>({
      length: 1,
      isFlat: true,
    });
    const [client] = rlpReader.readArray<string>({
      length: 1,
      isFlat: true,
    });
    const capabilities = rlpReader.readArray<string[]>({
      length: 1,
      isFlat: true,
    });
    const [listenPort] = rlpReader.readArray<number | boolean>({
      length: 1,
      isFlat: true,
    });
    const [nodeId] = rlpReader.readArray<string>({
      length: 1,
    });
    return {
      protocolVersion,
      capabilities,
      listenPort: typeof listenPort === 'boolean' ? 0 : listenPort,
      userAgent: client,
      nodeId,
      //   version: capabilities[0][0] as unknown as number,
    };
  }

  public encodeHello({ packet }: { packet: ParsedHelloPacket }) {
    const helloPacket = new RlpEncoder().encode({
      input: [
        packet.protocolVersion,
        packet.userAgent,
        packet.capabilities,
        packet.listenPort,
        getBufferFromHex(packet.nodeId),
      ],
    });
    return Buffer.concat([Buffer.from([0x80]), getBufferFromHex(helloPacket)]);
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
  HELLO = 0x0,
  PING = 1,
  PONG = 2,
  FIND_NODE = 3,
  NEIGHBORS = 4,
  UNKNOWN,
}

interface ParsedHelloPacket {
  userAgent: string | number;
  capabilities: string[][];
  protocolVersion: number;
  listenPort: number;
  nodeId: string;
}

interface ParsedPacket {
  packetType: PacketTypes;
}

type DecodedPacketTypes =
  | PingPacket
  | PongPacket
  | FindNodePacket
  | NeighborsPacket;
