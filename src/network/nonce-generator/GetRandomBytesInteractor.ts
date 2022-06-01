import crypto from 'crypto';
import { injectable, inject } from 'inversify';

@injectable()
export class GetRandomBytesInteractor {
  constructor(
    @inject<boolean>('SHOULD_RANDOMNESS_BE_DETERMINISTIC')
    public shouldBeRandom: boolean
  ) {}

  public getRandomBytess({ length }: { length: number }) {
    if (this.shouldBeRandom) {
      return crypto.randomBytes(length);
    } else {
      return Buffer.alloc(length);
    }
  }
}
