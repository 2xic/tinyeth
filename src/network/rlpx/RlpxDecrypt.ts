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

    const decryptedMessage = this.rlpxEcies.decryptMessage({
      message: message.slice(0, length),
      mac: lengthBuffer,
    });
    return decryptedMessage;
  }
}
