import { injectable } from 'inversify';
import { ConstructAuthMessage } from './ConstructAuthMessage';
@injectable()
export class EncodeAuthEip8 {
  constructor(private constructAuthMessage: ConstructAuthMessage) {}

  public createAuthMessageEip8({
    ethNodePublicKey,
  }: {
    ethNodePublicKey: string;
  }) {
    const { bufferSignature, rawPublicKey, nonce, ecdhKey } =
      this.constructAuthMessage.getSharedFields({
        ethNodePublicKey,
      });

    return {
      results: [bufferSignature, rawPublicKey, nonce, Buffer.from([0x4])],
      header: {
        secret: ecdhKey,
        nonce,
      },
      metadata: {
        bufferSignature,
        rawPublicKey,
        nonce,
        ecdhKey,
      },
    };
  }
}
