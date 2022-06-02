import crypto from 'crypto';
import { injectable, inject } from 'inversify';

@injectable()
export class GetRandomBytesInteractor {
  constructor(
    @inject<boolean>('SHOULD_RANDOMNESS_BE_DETERMINISTIC')
    public shouldBeDeterministic: boolean
  ) {}

  public getRandomBytes({ length }: { length: number }) {
    if (!this.shouldBeDeterministic) {
      return crypto.randomBytes(length);
    } else {
      return Buffer.alloc(length);
    }
  }
}
