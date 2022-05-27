import { RlpDecoder } from '../../rlp/RlpDecoder';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { Rlpx } from '../Rlpx';

export class DecodeAuthEip8 {
  constructor(private rlpx: Rlpx) {}

  public async decodeAuthEip8({ input }: { input: Buffer }) {
    const decryptedMessage = await this.rlpx.decryptMessage({
      encryptedMessage: input,
    });
    const decodedPacket = new RlpDecoder().decode({
      input: decryptedMessage.toString('hex'),
      returnOnError: true,
    });

    const [signature, publicKey, nonce, version] = new ReadOutRlp(
      decodedPacket
    ).readArray({
      length: 4,
      isFlat: true,
    });

    return {
      signature,
      publicKey,
      nonce,
      version,
    };
  }

  public async decodeAckEip8({ input }: { input: Buffer }) {
    const decryptedMessage = await this.rlpx.decryptMessage({
      encryptedMessage: input,
    });
    const decodedPacket = new RlpDecoder().decode({
      input: decryptedMessage.toString('hex'),
      returnOnError: true,
    });

    const [publicKey, nonce, version] = new ReadOutRlp(decodedPacket).readArray(
      {
        length: 4,
        isFlat: true,
      }
    );

    return {
      publicKey,
      nonce,
      version,
    };
  }
}
