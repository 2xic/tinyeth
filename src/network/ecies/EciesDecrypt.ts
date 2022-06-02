import { KeyPair } from '../../signatures/KeyPair';
import { assertBufferFirstItemValue, assertEqual } from '../../utils/enforce';
import { kdf } from 'ecies-geth';
import crypto from 'crypto';
import { injectable } from 'inversify';

@injectable()
export class EciesDecrypt {
  constructor(private keyPair: KeyPair) {}

  public async decryptMessage(options: { message: Buffer; mac?: Buffer }) {
    // Public keys start with 4 in ETH land.
    assertBufferFirstItemValue(options.message, 4);

    const publicKey = options.message.slice(0, 65);
    assertEqual(publicKey.length, 65);

    const shared = this.keyPair.getEcdh({
      publicKey: publicKey.toString('hex'),
    });
    const secret = await kdf(shared, 32);
    this.validateMessage({
      secret,
      message: options.message,
      mac: options.mac || Buffer.from([]),
    });

    const encryptionKey = secret.slice(0, 16);
    const slicedMessage = options.message.slice(65);
    const message = this.decrypt({
      slicedMessage,
      encryptionKey,
    });

    return message;
  }

  private validateMessage({
    secret,
    message,
    mac,
  }: {
    secret: Buffer;
    message: Buffer;
    mac: Buffer;
  }) {
    const data = message.slice(65, -32);
    const macKey = crypto
      .createHash('sha256')
      .update(secret.slice(16, 32))
      .digest();
    const computedPacketHash = crypto
      .createHmac('sha256', macKey)
      .update(Buffer.concat([data, mac]))
      .digest('hex');

    const receivedPacketHash = message.slice(-32).toString('hex');
    assertEqual(computedPacketHash, receivedPacketHash, 'wrong hash');
  }

  private decrypt({
    slicedMessage,
    encryptionKey,
  }: {
    slicedMessage: Buffer;
    encryptionKey: Buffer;
  }) {
    const ivKey = slicedMessage.slice(0, 16);
    const messageData = slicedMessage.slice(16, -32);
    const decryptedMessage = crypto
      .createDecipheriv('aes-128-ctr', encryptionKey, ivKey)
      .update(messageData);

    return decryptedMessage;
  }
}
