import { keccak256 } from '../../../utils/keccak256';
import { EncodeFrame } from './EncodeFrame';
import { DecodeFrame } from './DecodeFrame';
import { LoggerFactoryOptions } from 'typescript-logging';
import { Logger } from '../../../utils/Logger';

export class FrameCommunication {
  constructor(
    private encodeFrame: EncodeFrame = new EncodeFrame(),
    private decodeFrame: DecodeFrame = new DecodeFrame(),
    private logger = new Logger()
  ) {}

  public setup({
    remotePacket,
    initiatorPacket,
    receiverNonce,
    initiatorNonce,
    ephemeralSharedSecret,
    switchNonce = false,
  }: {
    remotePacket: Buffer;
    initiatorPacket: Buffer;
    receiverNonce: Buffer;
    initiatorNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce?: boolean;
  }) {
    const { aesKey, macKey } = this.constructKeys({
      receiverNonce,
      initiatorNonce,
      ephemeralSharedSecret,
      switchNonce,
    });
    this.decodeFrame.setup({
      aesKey: aesKey,
      mac: {
        nonce: initiatorNonce,
        packet: remotePacket,
        macKey: macKey,
      },
    });

    this.encodeFrame.setup({
      aesKey: aesKey,
      mac: {
        nonce: receiverNonce,
        packet: initiatorPacket,
        macKey: macKey,
      },
    });

    return this;
  }

  public encode({ message }: { message: Buffer }) {
    const header = this.encodeFrame.encodeHeader({ message });
    const body = this.encodeFrame.encodeBody({ message });

    return Buffer.concat([header, body]);
  }

  public decode({ message }: { message: Buffer }) {
    const header = this.decodeFrame.parseHeader({ message });
    const size = (header[0] << 16) + (header[1] << 8) + header[2];
    this.logger.log(`Got header with ${size} length`);

    const body = this.decodeFrame.parseBody({
      message,
      size,
    });

    this.logger.log(`\t Decoded stream ${body.toString('hex')}`);

    return body;
  }

  private constructKeys({
    receiverNonce,
    initiatorNonce,
    ephemeralSharedSecret,
    switchNonce,
  }: {
    receiverNonce: Buffer;
    initiatorNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce: boolean;
  }) {
    const nonce = switchNonce
      ? keccak256(Buffer.concat([initiatorNonce, receiverNonce]))
      : keccak256(Buffer.concat([receiverNonce, initiatorNonce]));

    const nonceEphemeral = keccak256(
      Buffer.concat([ephemeralSharedSecret, nonce])
    );

    const aesKey = keccak256(
      Buffer.concat([ephemeralSharedSecret, nonceEphemeral])
    );

    const macKey = keccak256(Buffer.concat([ephemeralSharedSecret, aesKey]));

    return {
      aesKey,
      macKey,
    };
  }
}
