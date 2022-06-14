import { injectable } from 'inversify';
import { KeyPair } from '../../../signatures/KeyPair';
import { FrameCommunication } from '../../auth/frameing/FrameCommunication';
import {
  ParsedHelloPacket,
  RlpxHelloPacketEncoderDecoder,
} from './RlpxHelloPacketEncoderDecoder';

@injectable()
export class ReplayHelloPacket {
  constructor(
    private frameCommunication: FrameCommunication,
    private keyPair: KeyPair,
    private helloPacketEncoder: RlpxHelloPacketEncoderDecoder
  ) {}

  public replayPacket({ hello }: { hello: ParsedHelloPacket }) {
    const helloMessage = this.helloPacketEncoder.encode({
      input: {
        ...hello,
        nodeId: `0x${this.keyPair.getPublicKey()}`,
      },
    });
    const encodedMessage = this.frameCommunication.encode({
      message: helloMessage,
    });
    return encodedMessage;
  }
}
