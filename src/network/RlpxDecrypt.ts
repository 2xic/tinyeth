import { KeyPair } from '../signatures/KeyPair';
import { RlpxEcies } from './RlpxEcies';
import { assertEqual } from '../utils/enforce';
import { injectable } from 'inversify';

@injectable()
export class RlpxDecrpyt {
  constructor(private keyPair: KeyPair) {}

  public async decryptMessage({
    encryptedMessage,
  }: {
    encryptedMessage: Buffer;
  }): Promise<Buffer> {
    const isSimpleMessage = encryptedMessage[0] === 4;
    const lengthBuffer = isSimpleMessage
      ? Buffer.from([])
      : encryptedMessage.slice(0, 2);
    const message = isSimpleMessage
      ? encryptedMessage
      : encryptedMessage.slice(2);
    const length = isSimpleMessage
      ? message.length
      : lengthBuffer.readUInt16BE();

    assertEqual(length, message.length);

    const decryptedMessage = new RlpxEcies(this.keyPair).decryptMessage({
      // skip first two bytes because they just say the length
      // might have to reconsider this when the node is connected to the network to prevent ddos etc.
      message,
      mac: lengthBuffer,
    });
    return decryptedMessage;
  }
}
