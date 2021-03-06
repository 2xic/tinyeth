import { injectable } from 'inversify';
import { InputTypes, RlpEncoder } from '../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Logger } from '../../utils/Logger';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { EthMessageType } from './CommunicationState';
import { RlpxPacketTypes } from './packet-types/RlpxMessageDecoder';
import { SnappyCompress } from './SnappyCompress';

@injectable()
export class RlpxMessageEncoder {
  constructor(
    private rlpEncoder: RlpEncoder,
    private frameCommunication: FrameCommunication,
    private logger: Logger
  ) {}

  public encodeEthMessage({
    code,
    payload,
  }: {
    code: EthMessageType;
    payload: InputTypes[];
  }) {
    const message = this.sharedEncoding({
      command: code,
      payload,
    });

    return message;
  }

  public encodeMessage(
    code: RlpxPacketTypes.PONG | RlpxPacketTypes.PING | RlpxPacketTypes.HELLO,
    payload: InputTypes = []
  ) {
    const message = this.sharedEncoding({
      compress: code !== RlpxPacketTypes.HELLO,
      command: code,
      payload,
    });

    return message;
  }

  private sharedEncoding({
    command,
    payload,
    compress = true,
  }: {
    command: RlpxPacketTypes | EthMessageType;
    compress?: boolean;
    payload: InputTypes;
  }) {
    const rawMessage = Buffer.concat([
      getBufferFromHex(this.rlpEncoder.encode({ input: command })),
      this.parseParameters({
        compress,
        buffer: getBufferFromHex(this.rlpEncoder.encode({ input: payload })),
      }),
    ]);
    this.logger.log(rawMessage.toString('hex'));
    const message = this.frameCommunication.encode({
      message: rawMessage,
    });

    this.logger.log(`encoding ${rawMessage.toString('hex')}`);
    return message;
  }

  private parseParameters({
    compress,
    buffer,
  }: {
    compress?: boolean;
    buffer: Buffer;
  }) {
    if (!compress) {
      return buffer;
    }
    return SnappyCompress(buffer);
  }
}
