import { keccak256 } from '../../../utils/keccak256';
import { EncodeFrame } from './EncodeFrame';
import { DecodeFrame } from './DecodeFrame';
import { Logger } from '../../../utils/Logger';
import { injectable } from 'inversify';

@injectable()
export class FrameCommunication {
  constructor(
    protected encodeFrame: EncodeFrame,
    protected decodeFrame: DecodeFrame,
    protected logger: Logger
  ) {}

  private nextSize: number | undefined;

  protected initializedOptions?: {
    remotePacket: Buffer;
    initiatorPacket: Buffer;
    receiverNonce: Buffer;
    initiatorNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce?: boolean;
    aesKey: Buffer;
    macKey: Buffer;
  };

  public setup({
    localPacket,
    localNonce,
    remotePacket,
    remoteNonce,
    ephemeralSharedSecret,
    switchNonce = false,
  }: {
    localPacket: Buffer;
    localNonce: Buffer;
    remotePacket: Buffer;
    remoteNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce?: boolean;
  }) {
    const { aesKey, macKey } = this.constructKeys({
      localNonce: localNonce,
      remoteNonce: remoteNonce,
      ephemeralSharedSecret,
      switchNonce,
    });
    this.decodeFrame.setup({
      aesKey: aesKey,
      mac: {
        nonce: localNonce,
        packet: remotePacket,
        macKey: macKey,
      },
    });

    this.encodeFrame.setup({
      aesKey: aesKey,
      mac: {
        nonce: remoteNonce,
        packet: localPacket,
        macKey: macKey,
      },
    });

    this.initializedOptions = {
      remotePacket,
      initiatorPacket: localPacket,
      receiverNonce: localNonce,
      initiatorNonce: remoteNonce,
      ephemeralSharedSecret,
      switchNonce,
      aesKey,
      macKey,
    };

    return this;
  }

  public encode({ message }: { message: Buffer }) {
    const header = this.encodeFrame.encodeHeader({ message });
    const body = this.encodeFrame.encodeBody({ message });

    return Buffer.concat([header, body]);
  }

  public decode({ message }: { message: Buffer }) {
    let size;
    let skip = 32;
    if (!this.nextSize) {
      const header = this.decodeFrame.parseHeader({ message });
      size = header.slice(0, 3).readIntBE(0, 3);
      this.logger.log(`Got header with ${size} length`);
      if (message.length - 32 < size) {
        this.nextSize = size;
        return Buffer.alloc(0);
      }
    } else {
      size = this.nextSize;
      skip = 0;
      this.logger.log(`Had header with ${size} length`);
    }

    const body = this.decodeFrame.parseBody({
      message,
      size,
      skip,
    });

    this.logger.log(`\t Decoded stream ${body.toString('hex')}`);
    this.nextSize = undefined;

    return body;
  }

  private constructKeys({
    localNonce: localNonce,
    remoteNonce: remoteNonce,
    ephemeralSharedSecret,
    switchNonce,
  }: {
    localNonce: Buffer;
    remoteNonce: Buffer;
    ephemeralSharedSecret: Buffer;
    switchNonce: boolean;
  }) {
    const nonce = switchNonce
      ? keccak256(Buffer.concat([remoteNonce, localNonce]))
      : keccak256(Buffer.concat([localNonce, remoteNonce]));

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
