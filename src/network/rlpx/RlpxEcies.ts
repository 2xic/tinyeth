import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { EciesDecrypt } from '../ecies/EciesDecrypt';
import { EciesEncrypt } from '../ecies/EciesEncrypt';

@injectable()
export class RlpxEcies {
  constructor(
    private keyPair: KeyPair,
    private eciesEncrypt: EciesEncrypt,
    private eciesDecrypt: EciesDecrypt
  ) {}

  public decryptMessage(options: {
    message: Buffer;
    mac?: Buffer;
  }): Promise<Buffer> {
    return this.eciesDecrypt.decryptMessage({
      message: options.message,
      mac: options.mac,
    });
  }

  public encryptMessage(options: {
    message: Buffer;
    remotePublicKey: Buffer;
    mac?: Buffer;
  }): Promise<Buffer> {
    return this.eciesEncrypt.encryptMessage({
      message: options.message,
      remotePublicKey: options.remotePublicKey,
      mac: options.mac,
    });
  }
}
