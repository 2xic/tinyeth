import { RlpxEcies } from './RlpxEcies';
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

    // NOTE: looks like this is not required, but you can slice
    // assertEqual(length, message.length, 'Wrong length of decrypt message');

    const decryptedMessage = this.rlpxEcies.decryptMessage({
      // skip first two bytes because they just say the length
      // might have to reconsider this when the node is connected to the network to prevent ddos etc.
      message: message.slice(0, length),
      mac: lengthBuffer,
    });
    return decryptedMessage;
  }
}
