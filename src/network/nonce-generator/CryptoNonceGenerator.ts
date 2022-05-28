import { NonceGenerator } from './NonceGenerator';
import crypto from 'crypto';
import { injectable } from 'inversify';
@injectable()
export class CryptoNonceGenerator implements NonceGenerator {
  public generate({ length }: { length: number }): Buffer {
    const nonce = crypto.randomBytes(length);

    return nonce;
  }
}
