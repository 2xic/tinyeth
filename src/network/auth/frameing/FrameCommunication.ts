import { keccak256 } from '../../../utils/keccak256';
import { EncodeFrame } from './EncodeFrame';
import { DecodeFrame } from './DecodeFrame';

export class FrameCommunication {
  constructor(
    private encodeFrame: EncodeFrame = new EncodeFrame(),
    private decodeFrame: DecodeFrame = new DecodeFrame()
  ) {}

  public setup({
    remotePacket,
    initiatorPacket,
    receiverNonce,
    initiatorNonce,
    ephemeralSharedSecret,
  }: {
    remotePacket: Buffer;
    initiatorPacket: Buffer;
    receiverNonce: Buffer;
    initiatorNonce: Buffer;
    ephemeralSharedSecret: Buffer;
  }) {
    const { aesKey, macKey } = this.constructKeys({
      receiverNonce,
      initiatorNonce,
      ephemeralSharedSecret,
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

  public parse({ message }: { message: Buffer }) {
    const header = this.decodeFrame.parseHeader({ message });
    const body = this.decodeFrame.parseBody({
      message,
      size: (header[0] << 16) + (header[1] << 8) + header[2],
    });

    return body;
  }

  private constructKeys({
    receiverNonce,
    initiatorNonce,
    ephemeralSharedSecret,
  }: {
    receiverNonce: Buffer;
    initiatorNonce: Buffer;
    ephemeralSharedSecret: Buffer;
  }) {
    const nonce = keccak256(Buffer.concat([receiverNonce, initiatorNonce]));

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
