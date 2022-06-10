import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { Packet } from '../Packet';
import { ParsedHelloPacket } from './HelloPacketEncoderDecoer';

@injectable()
export class ReplayHelloPacket {
  constructor(
    private frameCommunication: FrameCommunication,
    private keyPair: KeyPair
  ) {}

  public replayPacket({ hello }: { hello: ParsedHelloPacket }) {
    const helloMessage = new Packet().encodeHello({
      packet: {
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
