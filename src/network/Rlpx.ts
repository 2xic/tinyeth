import { RlpEncoder } from '../rlp/RlpEncoder';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { xor } from './XorBuffer';
import { keccak256 } from './keccak256';
import { decrypt } from 'eciesjs';
import { getBufferFromHex } from './getBufferFromHex';

export class Rlpx {
  constructor(public keyPair: KeyPair, private rlpEncoder = new RlpEncoder()) {}

  public createAuthMessage({
    ethNodePublicKey,
    nonce: inputNonce,
  }: {
    ethNodePublicKey: string;
    nonce?: Buffer;
  }): Buffer {
    // This is actually the encrypted code in the pydevp2p
    const authMessage = [
      // auth = auth-size || enc-auth-body
      // auth-size = size of enc-auth-body, encoded as a big-endian 16-bit integer
      Buffer.from([0x04]),
    ];
    /*    
        auth-body = [sig, initiator-pubk, initiator-nonce, auth-vsn, ...]
        enc-auth-body = ecies.encrypt(recipient-pubk, auth-body || auth-padding, auth-size)
        auth-padding = arbitrary data
    */
    const body = this.rlpEncoder.encode({ input: authMessage });
    const nonce = inputNonce || crypto.randomBytes(32);

    const token = Buffer.from(
      this.keyPair.getEcdh({
        publicKey: ethNodePublicKey,
        privateKey: this.keyPair.privatekey,
      })
    );
    const tokenXorNonce = xor(token, nonce);
    if (tokenXorNonce.length !== 32) {
      throw new Error('Something is wrong with the xor token function');
    }
    const { fullSignature } = new KeyPair().signMessage({
      privateKey: this.keyPair.privatekey,
      message: tokenXorNonce,
    });
    const bufferSignature = Buffer.from(fullSignature, 'hex');
    if (bufferSignature.length !== 65) {
      throw new Error(
        `Something is wrong with the signature function, expected length 65, but received ${bufferSignature.length}`
      );
    }
    /*
            static-shared-secret = ecdh.agree(privkey, remote-pubk)
            ephemeral-key = ecdh.agree(ephemeral-privkey, remote-ephemeral-pubk)
            shared-secret = keccak256(ephemeral-key || keccak256(nonce || initiator-nonce))
            aes-secret = keccak256(ephemeral-key || shared-secret)
            mac-secret = keccak256(ephemeral-key || aes-secret)
    */

    // https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/rlpxcipher.py#L194
    // S || H(ephemeral-pubk) || pubk || nonce || 0x0
    const hashSignature = keccak256(
      Buffer.from(this.keyPair.getPublicKey(), 'hex')
    );
    const rawPublicKey = Buffer.from(this.keyPair.getPublicKey(), 'hex');

    if (rawPublicKey.length !== 64) {
      throw new Error(
        `Wrong raw key length, expected 64, but got ${rawPublicKey.length}`
      );
    }

    return Buffer.concat([
      bufferSignature,
      hashSignature,
      rawPublicKey,
      nonce,
      Buffer.from(String.fromCharCode(0x0)),
    ]);
  }

  // Maybe just using https://github.com/ecies/js is better
  // https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/crypto.py#L115
  public encryptedMessage({
    message,
    responderPublicKey: inputResponderPublicKey,
  }: {
    message: Buffer;
    responderPublicKey: Buffer | string;
  }): Buffer {
    throw new Error('Not implemented');
  }

  public decryptMessage({
    encryptedMessage,
    responderPublicKey: inputResponderPublicKey,
  }: {
    encryptedMessage: Buffer;
    responderPublicKey: Buffer | string;
  }) {
    const responderPublicKey = getBufferFromHex(inputResponderPublicKey);
    console.log(responderPublicKey);
    return decrypt(responderPublicKey, encryptedMessage);
  }

  public decryptPacket({ message }: { message: string }): {
    header: unknown;
    body: unknown;
  } {
    throw new Error('Not implemented');
  }
}
