import { RlpDecoder } from '../../rlp/RlpDecoder';
import { ReadOutRlp } from '../../rlp/ReadOutRlp';
import { injectable } from 'inversify';
import { RlpxDecrpyt } from '../rlpx/RlpxDecrypt';
import { assertEqual } from '../../utils/enforce';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { verifyPacketLength } from './verifyPacketLength';

@injectable()
export class DecodeAuthEip8 {
  constructor(private rlpx: RlpxDecrpyt, private rlpDecoder: RlpDecoder) {}

  public async decodeAuthEip8({ input }: { input: Buffer }) {
    const decryptedMessage = await this.rlpx.decryptMessage({
      encryptedMessage: input,
    });
    const decodedPacket = this.rlpDecoder.decode({
      input: decryptedMessage.toString('hex'),
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
    verifyPacketLength({ packet: input });
    const decryptedMessage = await this.rlpx.decryptMessage({
      encryptedMessage: input,
    });

    const decodedPacket = this.rlpDecoder.decode({
      input: decryptedMessage.toString('hex'),
    });

    const [publicKey, nonce, version] = new ReadOutRlp(decodedPacket).readArray(
      {
        length: 4,
        isFlat: true,
      }
    );
    assertEqual(
      getBufferFromHex(publicKey).length,
      64,
      'wrong publickey length'
    );
    assertEqual(getBufferFromHex(nonce).length, 32, 'wrong nonce length');
    assertEqual(version, 4, 'wrong version');

    return {
      publicKey,
      nonce,
      version,
    };
  }
}
