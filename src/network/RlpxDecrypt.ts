import { RlpxEcies } from './RlpxEcies';
import { assertEqual } from '../utils/enforce';
import { injectable } from 'inversify';

@injectable()
export class RlpxDecrpyt {
  constructor(private rlpxEcies: RlpxEcies) {}

  public async decryptMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }): Promise<Buffer> {
    const lengthBuffer = encryptedMessage.slice(0, 2);
    const message = encryptedMessage.slice(2);
    const length = lengthBuffer.readUInt16BE();

    assertEqual(length, message.length);

    const decryptedMessage = this.rlpxEcies.decryptMessage({
      // skip first two bytes because they just say the length
      // might have to reconsider this when the node is connected to the network to prevent ddos etc.
      message,
      mac: lengthBuffer,
    });
    return decryptedMessage;
  }
}
