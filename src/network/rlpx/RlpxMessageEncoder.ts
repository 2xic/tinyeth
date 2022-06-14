import { injectable } from 'inversify';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { RlpxPacketTypes } from './packet-types/RlpxMessageDecoder';

@injectable()
export class RlpxMessageEncoder {
  constructor(
    private rlpEncoder: RlpEncoder,
    private frameCommunication: FrameCommunication
  ) {}

  public encodeMessage(
    code: RlpxPacketTypes.PONG | RlpxPacketTypes.PING | RlpxPacketTypes.HELLO,
    payload: InputTypes = []
  ) {
    return this.frameCommunication.encode({
      message: Buffer.concat([
        getBufferFromHex(this.rlpEncoder.encode({ input: code })),
        getBufferFromHex(this.rlpEncoder.encode({ input: payload })),
      ]),
    });
  }
}
