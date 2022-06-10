import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { parseHexIp } from '../utils/parseHexIp';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { PacketEncodeDecode } from './PacketEncodeDecode';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import ip6addr from 'ip6addr';
import { injectable } from 'inversify';

@injectable()
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
        this.getIpBuffer(_input.fromIp),
        _input.fromUdpPort
          ? Buffer.from(convertNumberToPadHex(_input.fromUdpPort), 'hex')
          : Buffer.alloc(0),
        _input.fromTcpPort
          ? Buffer.from(convertNumberToPadHex(_input.fromTcpPort), 'hex')
          : Buffer.alloc(0),
      ],
      [
        this.getIpBuffer(_input.toIp),
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
      isNumeric: true,
      isFlat: true,
    });
    const [senderIp, senderUdp, senderTcp] = rlpReader.readArray<Buffer>({
      length: 3,
      isBuffer: true,
    });
    const [recipientIp, recipientUdpPort, recipientTcpPort] =
      rlpReader.readArray<Buffer>({
        length: 3,
        isBuffer: true,
      });
    const [expiration] = rlpReader.readArray<number>({
      length: 1,
      isNumeric: true,
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

  private getIpBuffer(ip: string) {
    const encoded = Buffer.from(ip6addr.parse(ip).toBuffer());
    const isIpv4 = ip.split('.').length === 4;

    return isIpv4 ? encoded.slice(-4) : encoded;
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
