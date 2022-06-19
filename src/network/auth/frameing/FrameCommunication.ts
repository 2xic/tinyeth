import { keccak256 } from '../../../utils/keccak256';
import { EncodeFrame } from './EncodeFrame';
import { DecodeFrame } from './DecodeFrame';
import { Logger } from '../../../utils/Logger';
import { injectable } from 'inversify';
import { MessageQueue } from '../../rlpx/MessageQueue';
import { getNumberFromBuffer } from '../../utils/getNumberFromBuffer';

@injectable()
export class FrameCommunication {
  constructor(
    protected encodeFrame: EncodeFrame,
    protected decodeFrame: DecodeFrame,
    protected logger: Logger,
    private messageQueue: MessageQueue
  ) {}

  private state: State = State.HEADER;

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
  }: FrameCommunicationSetup) {
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
    let skip;

    if (this.state === State.HEADER) {
      const header = this.decodeFrame.parseHeader({ message });
      const bodySize = getNumberFromBuffer(header.slice(0, 3));
      let nextSize = bodySize + 16;
      skip = 32;

      // Backwards compatibility for now.
      if (message.length - 32 < nextSize) {
        if (bodySize % 16 > 0) nextSize += 16 - (bodySize % 16);

        this.messageQueue.setLimit({
          size: nextSize,
        });
        this.state = State.BODY;

        return Buffer.alloc(0);
      }
      size = nextSize;
    } else {
      size = message.length;
      skip = 0;
    }

    const body = this.decodeFrame.parseBody({
      message,
      size,
      skip,
    });

    this.logger.log(`\t Decoded stream ${body.toString('hex')}`);
    this.state = State.HEADER;
    this.messageQueue.setLimit({
      size: 32,
    });

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

export interface FrameCommunicationSetup {
  localPacket: Buffer;
  localNonce: Buffer;
  remotePacket: Buffer;
  remoteNonce: Buffer;
  ephemeralSharedSecret: Buffer;
  switchNonce?: boolean;
}

enum State {
  HEADER,
  BODY,
}
