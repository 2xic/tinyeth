import { injectable } from 'inversify';
import { KeyPair } from '../../signatures';
import { Signatures } from '../../signatures/Signatures';
import { assertEqual } from '../../utils/enforce';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { xor } from '../../utils/XorBuffer';
import { Auth8Eip } from '../auth/AuthEip8';
import { Rlpx } from '../Rlpx';

@injectable()
export class DecodeAuthMessageInteractor {
  constructor(
    private rlpx: Rlpx,
    private keyPair: KeyPair,
    private signatures: Signatures,
    private ephemeralKeyPair: KeyPair,
    private auth8Eip: Auth8Eip
  ) {}

  public async decode({
    remotePublicKey: inputRemotePublicKey,
    authMessage,
  }: {
    authMessage: Buffer;
    remotePublicKey: string;
  }) {
    const decodedAuthMessage = await this.auth8Eip.decodeAuthEip8({
      input: authMessage,
    });
    const sharedSecret = this.keyPair.getEcdh({
      publicKey: inputRemotePublicKey,
    });

    const remoteNonce = getBufferFromHex(decodedAuthMessage.nonce);
    const remotePublicKey = this.signatures.getPublicKeyFromSignature({
      message: xor(sharedSecret, remoteNonce),
      signature: getBufferFromHex(decodedAuthMessage.signature).slice(0, 64),
      r: getBufferFromHex(decodedAuthMessage.signature)[64],
    });

    assertEqual(remotePublicKey, inputRemotePublicKey);

    const ephemeralSharedSecret = this.ephemeralKeyPair.getEcdh({
      publicKey: remotePublicKey,
    });

    const { results: ackPacket, header } =
      await this.rlpx.createEncryptedAckMessageEip8({
        ethNodePublicKey: remotePublicKey,
      });
    const localPacket = ackPacket;
    const localNonce = header.nonce;

    return {
      ephemeralSharedSecret,
      localNonce,
      localPacket,
      remoteNonce,
    };
  }
}
