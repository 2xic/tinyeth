import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { parseHexIp } from '../utils/parseHexIp';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { PacketEncodeDecode } from './PacketEncodeDecode';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import { injectable } from 'inversify';
import { getIpBuffer } from '../utils/getIpBuffer';

@injectable()
export class PingPacketEncodeDecode implements PacketEncodeDecode<PingPacket> {
  public encode(options: { input: PingPacket }): string {
    const _input = options.input;
    const input: InputTypes = [
      0x4,
      [
        getIpBuffer(_input.fromIp),
        _input.fromUdpPort
          ? Buffer.from(convertNumberToPadHex(_input.fromUdpPort), 'hex')
          : Buffer.alloc(0),
        _input.fromTcpPort
          ? Buffer.from(convertNumberToPadHex(_input.fromTcpPort), 'hex')
          : Buffer.alloc(0),
      ],
      [
        getIpBuffer(_input.toIp),
        Buffer.from(convertNumberToPadHex(_input.toUdpPort), 'hex'),
        Buffer.from(convertNumberToPadHex(_input.toTcpPort), 'hex'),
      ],
      Buffer.from(convertNumberToPadHex(_input.expiration), 'hex'),
      ...(_input.sequence ? _input.sequence : []),
    ];

    const encoded = new RlpEncoder().encode({
      input,
    });

    return encoded;
  }

  public decode(options: { input: SimpleTypes[] }): PingPacket {
    const rlpReader = new ReadOutRlp(options.input);

    const [version] = rlpReader.readArray<number>({
      length: 1,
      convertToNumber: true,
      isFlat: true,
    });
    const [senderIp, senderUdp, senderTcp] = rlpReader.readArray<Buffer>({
      length: 3,
      convertToBuffer: true,
    });
    const [recipientIp, recipientUdpPort, recipientTcpPort] =
      rlpReader.readArray<Buffer>({
        length: 3,
        convertToBuffer: true,
      });
    const [expiration] = rlpReader.readArray<number>({
      length: 1,
      convertToNumber: true,
    });

    return {
      version,
      expiration,
      fromIp: parseHexIp(senderIp),
      fromTcpPort: senderTcp.readIntBE(0, senderTcp.length).toString(),
      fromUdpPort: senderUdp.readIntBE(0, senderUdp.length).toString(),

      toIp: parseHexIp(recipientIp),
      toUdpPort: recipientUdpPort
        .readIntBE(0, recipientUdpPort.length)
        .toString(),
      toTcpPort: recipientTcpPort
        .readIntBE(0, recipientTcpPort.length)
        .toString(),
    };
  }
}

export interface PingPacket {
  version: number;
  expiration: number;
  fromIp: string;
  fromUdpPort: string | null;
  fromTcpPort: string | null;

  toIp: string;
  toUdpPort: string;
  toTcpPort: string;

  sequence?: number[];
}
