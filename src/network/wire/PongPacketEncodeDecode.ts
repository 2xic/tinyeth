import { injectable } from 'inversify';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { getIpBuffer } from '../utils/getIpBuffer';
import { getNumberFromBuffer } from '../utils/getNumberFromBuffer';
import { parseHexIp } from '../utils/parseHexIp';
import { PacketEncodeDecode } from './PacketEncodeDecode';

@injectable()
export class PongPacketEncodeDecode implements PacketEncodeDecode<PongPacket> {
  public encode(options: { input: PongPacket }): string {
    const _input = options.input;
    const convertPort = (port: string | null) =>
      port
        ? Buffer.from(convertNumberToPadHex(_input.toUdpPort), 'hex')
        : Buffer.alloc(0);

    const input: InputTypes = [
      [
        getIpBuffer(_input.toIp),
        convertPort(_input.toUdpPort),
        convertPort(_input.toTcpPort),
      ],
      getBufferFromHex(options.input.hash),
      Buffer.from(convertNumberToPadHex(_input.expiration), 'hex'),
    ];

    console.log(input);

    const encoded = new RlpEncoder().encode({
      input,
    });

    return encoded;
  }

  public decode(options: { input: SimpleTypes[] }): PongPacket {
    const rlpStructureParser = new ReadOutRlp(options.input);
    const [toAddress, toTcpPort, toUdpPort] =
      rlpStructureParser.readArray<Buffer>({
        length: 3,
        isBuffer: true,
      });

    const [hash] = rlpStructureParser.readArray<string>({
      length: 1,
      isFlat: true,
    });

    const [expiration] = rlpStructureParser.readArray<number>({
      length: 1,
      isNumeric: true,
    });

    return {
      toIp: parseHexIp(toAddress),
      toTcpPort: getNumberFromBuffer(toTcpPort).toString(),
      toUdpPort: getNumberFromBuffer(toUdpPort).toString(),
      hash,
      expiration,
    };
  }
}

export interface PongPacket {
  toIp: string;
  toUdpPort: string;
  toTcpPort: string;

  hash: string;
  expiration: number;
}
