import { KeyPair } from '../../signatures/KeyPair';
import { kdf } from 'ecies-geth';
import crypto from 'crypto';
import { GetRandomBytesInteractor } from '../nonce-generator/GetRandomBytesInteractor';
import { injectable } from 'inversify';

@injectable()
export class EciesEncrypt {
  constructor(
    private getRandomBytesInteractor: GetRandomBytesInteractor,
    private keyPair: KeyPair
  ) {}

  public async encryptMessage(options: {
    message: Buffer;
    remotePublicKey: Buffer;
    mac?: Buffer;
  }) {
    const shared = this.keyPair.getEcdh({
      publicKey: options.remotePublicKey.toString('hex'),
    });
    const secret = await kdf(shared, 32);
    const encryptionKeys = this.createKeys({
      secret,
    });
    const encryptedMessage = this.encrypt({
      message: options.message,
      ...encryptionKeys,
      mac: options.mac || Buffer.from([]),
    });

    const ourPublicKey = Buffer.from(
      this.keyPair.getPublicKey({
        skipSlice: true,
      }),
      'hex'
    );

    return Buffer.concat([ourPublicKey, encryptedMessage]);
  }

  private createKeys({ secret }: { secret: Buffer }) {
    const encryptionKey = secret.slice(0, 16);
    const macKey = crypto
      .createHash('sha256')
      .update(secret.slice(16, 32))
      .digest();

    const ivKey = this.getRandomBytesInteractor.getRandomBytes({ length: 16 });

    return {
      encryptionKey,
      macKey,
      ivKey,
    };
  }

  private encrypt({
    message,
    macKey,
    encryptionKey,
    ivKey,
    mac,
  }: {
    message: Buffer;
    macKey: Buffer;
    encryptionKey: Buffer;
    ivKey: Buffer;
    mac: Buffer;
  }) {
    const encryptedMessage = crypto
      .createCipheriv('aes-128-ctr', encryptionKey, ivKey)
      .update(message);

    const IvEncryptedMessage = Buffer.concat([ivKey, encryptedMessage]);
    const messageHash = crypto
      .createHmac('sha256', macKey)
      .update(Buffer.concat([IvEncryptedMessage, mac]))
      .digest();

    return Buffer.concat([IvEncryptedMessage, messageHash]);
  }
}
