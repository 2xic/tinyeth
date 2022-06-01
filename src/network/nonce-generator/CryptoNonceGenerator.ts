import { NonceGenerator } from './NonceGenerator';
import crypto from 'crypto';
import { injectable } from 'inversify';
import { Logger } from '../../utils/Logger';
import { ThirtyFpsSelect } from '@mui/icons-material';
@injectable()
export class CryptoNonceGenerator implements NonceGenerator {
  constructor(private logger: Logger) {}

  public generate({ length }: { length: number }): Buffer {
    const nonce = crypto.randomBytes(length);

    this.logger.log(`nonce used : ${nonce.toString('hex')}`);

    return nonce;
  }
}
