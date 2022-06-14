import { injectable } from 'inversify';
import { KeyPair } from '../../signatures';
import { assertEqual } from '../../utils/enforce';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Auth8Eip } from '../auth/AuthEip8';

@injectable()
export class DecodeAckMessageInteractor {
  constructor(private ephemeralKeyPair: KeyPair, private auth8Eip: Auth8Eip) {}

  public async decode({
    senderNonce,
    authMessage,
    ackMessage,
  }: {
    authMessage: Buffer;
    senderNonce: Buffer;
    ackMessage: Buffer;
  }) {
    const { nonce, publicKey }: { nonce: string; publicKey: string } =
      await this.auth8Eip.decodeAckEip8({
        input: ackMessage,
      });

    const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
      publicKey,
    });

    const receivedNonce = getBufferFromHex(nonce);

    assertEqual(getBufferFromHex(nonce).length, 32, 'Nonce length is wrong');
    assertEqual(
      getBufferFromHex(publicKey).length,
      64,
      'Public key length is wrong'
    );
    assertEqual(receivedNonce.length, 32, 'Received nonce length is wrong');
    assertEqual(senderNonce.length, 32, 'Nonce length is wrong');

    assertEqual(!!ackMessage.length, true, 'Element is not defined');
    assertEqual(!!authMessage, true, 'Element is not defined');

    assertEqual(
      Buffer.isBuffer(ephemeralSharedSecret),
      true,
      'shared secret should be buffer'
    );
    assertEqual(Buffer.isBuffer(ackMessage), true, 'message should be buffer');
    assertEqual(Buffer.isBuffer(receivedNonce), true, 'nonce should be buffer');
    assertEqual(
      Buffer.isBuffer(senderNonce),
      true,
      'sender nonce should be buffer'
    );
    assertEqual(
      Buffer.isBuffer(authMessage),
      true,
      'sender message should be buffer'
    );

    return {
      receivedNonce,
      ephemeralSharedSecret,
    };
  }
}
