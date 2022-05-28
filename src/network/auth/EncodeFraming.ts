import crypto from 'crypto';
import { MacInteractor } from './MacInteractor';

export class EncodeFraming {
  private aes: crypto.Decipher;
  constructor(
    private key: Buffer,
    private iv: Buffer,
    private macInteractor: MacInteractor
  ) {
    this.aes = crypto.createDecipheriv('aes-256-ctr', key, iv);
  }

  public encode() {
    const capabilityId = 0;
    const contextId = 0;

    const frameSize = Buffer.from([0]);
    const headerData = Buffer.from([capabilityId, contextId]);
    const headerPadding = Buffer.from(
      [...Array(headerData.length % 16)].map(() => 0)
    );

    const header = Buffer.concat([frameSize, headerData, headerPadding]);
    const headerChiperText = this.aes.update(header);
    const tag = this.macInteractor.slicedHash;

    return Buffer.concat([header, headerChiperText, tag]);
  }
}
