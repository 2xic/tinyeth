import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { parseHexIp } from '../parseHexIp';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { PacketEncodeDecode } from './PacketEncodeDecode';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import ip6addr from 'ip6addr';

export class PingPacketEncodeDecode implements PacketEncodeDecode<PingPacket> {
  public encode(options: { input: PingPacket }): string {
    /*
      packet-data = [4, from, to, expiration, enr-seq ...]
      from = [sender-ip, sender-udp-port, sender-tcp-port]
      to = [recipient-ip, recipient-udp-port, 0]
    */
    const _input = options.input;
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

  public decode(options: { input: SimpleTypes[] }): PingPacket {
    const rlpReader = new ReadOutRlp(options.input);

    const [version] = rlpReader.readArray<number>({
      length: 1,
      isNumeric: true,
    });
    const [sender, senderUdp, senderTcp] = rlpReader.readArray<string>({
      length: 3,
      isNumeric: true,
    });
    const [recipientIp, recipientUdpPort, recipientTcpPort] =
      rlpReader.readArray<string>({
        length: 3,
        isNumeric: true,
      });
    const [expiration] = rlpReader.readArray<number>({
      length: 1,
      isNumeric: true,
    });

    return {
      version,
      expiration,
      fromIp: parseHexIp(Buffer.from(sender)),
      fromTcpPort: senderTcp,
      fromUdpPort: senderUdp,

      toIp: parseHexIp(Buffer.from(recipientIp)),
      toUdpPort: recipientUdpPort,
      toTcpPort: recipientTcpPort,
    };
  }
}

export interface PingPacket {
  version: number;
  expiration: number;
  fromIp: string;
  fromUdpPort: string;
  fromTcpPort: string;

  toIp: string;
  toUdpPort: string;
  toTcpPort: string;

  sequence?: number[];
}
