import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { parseHexIp } from '../parseHexIp';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { PacketEncodeDecode } from './PacketEncodeDecode';

export class PingPacketEncodeDecode implements PacketEncodeDecode<PingPacket> {
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
