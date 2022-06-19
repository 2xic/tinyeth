import { RlpEncoder } from '../../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { PacketEncodeDecode } from '../../wire/PacketEncodeDecode';
import { RlpDecoder } from '../../../rlp/RlpDecoder';
import { ReadOutRlp } from '../../../rlp/ReadOutRlp';
import { injectable } from 'inversify';

@injectable()
export class RlpxHelloPacketEncoderDecoder
  implements PacketEncodeDecode<ParsedHelloPacket>
{
  public encode(options: { input: ParsedHelloPacket }): Buffer {
    const packet = options.input;
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

  public decode(options: { input: Buffer }): ParsedHelloPacket {
    const input = options.input;
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
    };
  }
}

export interface ParsedHelloPacket {
  userAgent: string | number;
  capabilities: string[][];
  protocolVersion: number;
  listenPort: number;
  nodeId: string;
}
