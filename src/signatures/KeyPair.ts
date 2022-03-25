import secp256k1 from 'secp256k1';
import createKeccakHash from 'keccak';

export class KeyPair {
  public getAddress({ publicKey }: { publicKey: string }) {
    const publicKeyHash = createKeccakHash('keccak256')
      .update(Buffer.from(publicKey, 'hex'))
      .digest('hex');
    if (publicKeyHash.length !== 64) {
      throw new Error('Invalid hash');
    }

    const address = publicKeyHash.slice(24);
    return '0x' + address.toLowerCase();
  }

  public getPublicKey({ privateKey: inputPrivateKey }: { privateKey: string }) {
    const privateKey = inputPrivateKey.startsWith('0x')
      ? inputPrivateKey.slice(2)
      : inputPrivateKey;
    if (privateKey.length !== 64) {
      throw new Error('Invalid private key');
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const publicKeyUINT8Array = secp256k1
      .publicKeyCreate(privateKeyBuffer, false)
      .slice(1);
    if (publicKeyUINT8Array.length !== 64) {
      throw new Error('Invalid public key');
    }

    const publicKey = Buffer.from(publicKeyUINT8Array);
    return publicKey.toString('hex').toLowerCase();
  }

  public async verifyMessage({
    message,
    signature,
    r,
  }: {
    message: Uint8Array;
    signature: Uint8Array;
    r: number;
  }) {
    const publicKey = secp256k1
      .ecdsaRecover(signature, r, new Uint8Array(Buffer.from(message)), false)
      .slice(1);

    return Buffer.from(publicKey).toString('hex');
  }

  public signTransaction({
    chainId,
    privateKey,
    message,
  }: {
    message: Buffer;
    chainId?: number;
    privateKey: string;
  }) {
    const { signature, recovery } = this.signMessage({
      privateKey,
      message,
    });
    // same as https://github.com/ethereumjs/ethereumjs-util/blob/f51bfcab9e5505dfed4819ef1336f9fc00a12c3d/src/signature.ts#L38
    const r = Buffer.from(signature.slice(0, 32));
    const v = chainId ? recovery + (chainId * 2 + 35) : recovery + 27;
    const s = Buffer.from(signature.slice(32, 64));

    return {
      r,
      v,
      s,
    };
  }

  public hashAndSignMessage({
    privateKey: inputPrivateKey,
    message: inputMessage,
  }: {
    privateKey: string;
    message: string;
  }) {
    const hashBuffer = createKeccakHash('keccak256')
      .update(Buffer.from(inputMessage, 'hex'))
      .digest();

    return this.signMessage({
      message: hashBuffer,
      privateKey: inputPrivateKey,
    });
  }

  public signMessage({
    privateKey: inputPrivateKey,
    message,
  }: {
    privateKey: string;
    message: Buffer;
  }) {
    const privateKey = new Uint8Array(Buffer.from(inputPrivateKey, 'hex'));
    if (privateKey.length !== 32) {
      throw new Error('Invalid privatekey');
    }

    if (message.length !== 32) {
      throw new Error('Invalid message length');
    }

    const { signature, recid: recovery } = secp256k1.ecdsaSign(
      message,
      privateKey
    );

    return {
      fullSignature: `${Buffer.from(signature).toString('hex')}0${recovery}`,
      signature,
      recovery,
      message,
    };
  }

  public getPublicKeyFromSignature({
    signature,
    r,
    message,
  }: {
    signature: Uint8Array;
    r: number;
    message: Uint8Array;
  }) {
    return Buffer.from(
      secp256k1.ecdsaRecover(signature, r, message, false).slice(1)
    ).toString('hex');
  }
}
