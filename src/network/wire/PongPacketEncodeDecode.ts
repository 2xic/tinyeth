import { inject, injectable } from 'inversify';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import { SimpleTypes } from '../../rlp/types/TypeEncoderDecoder';
import { convertNumberToPadHex } from '../../utils/convertNumberToPadHex';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { getIpBuffer } from '../utils/getIpBuffer';
import { parseHexIp } from '../utils/parseHexIp';
import { PacketEncodeDecode } from './PacketEncodeDecode';

@injectable()
export class PongPacketEncodeDecode implements PacketEncodeDecode<PongPacket> {
  public encode(options: { input: PongPacket }): string {
    const _input = options.input;
    const input: InputTypes = [
      [
        getIpBuffer(_input.toIp),
        _input.toUdpPort
          ? Buffer.from(convertNumberToPadHex(_input.toUdpPort), 'hex')
          : Buffer.alloc(0),
        _input.toTcpPort
          ? Buffer.from(convertNumberToPadHex(_input.toTcpPort), 'hex')
          : Buffer.alloc(0),
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
      toTcpPort: toTcpPort.readIntBE(0, toTcpPort.length).toString(),
      toUdpPort: toUdpPort.readIntBE(0, toUdpPort.length).toString(),
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
