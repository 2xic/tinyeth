import { RlpxEcies } from './RlpxEcies';
import { injectable } from 'inversify';
import { verifyPacketLength } from '../auth/verifyPacketLength';

@injectable()
export class RlpxDecrpyt {
  constructor(private rlpxEcies: RlpxEcies) {}

  public async decryptMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }): Promise<Buffer> {
    const { length, lengthBuffer, message } = verifyPacketLength({
      packet: encryptedMessage,
    });

    const decryptedMessage = this.rlpxEcies.decryptMessage({
      message: message.slice(0, length),
      mac: lengthBuffer,
    });
    return decryptedMessage;
  }
}
