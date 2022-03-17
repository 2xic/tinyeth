import secp256k1 from "secp256k1";
import createKeccakHash from "keccak";
import BigNumber from "bignumber.js";
import bn from "bn.js";

export class KeyPair {
  constructor() {}

  public getAddress({ publicKey }: { publicKey: string }) {
    const publicKeyHash = createKeccakHash("keccak256")
      .update(Buffer.from(publicKey, "hex"))
      .digest("hex");
    if (publicKeyHash.length !== 64) {
      throw new Error("Invalid hash");
    }

    const address = publicKeyHash.slice(24);
    return "0x" + address.toLowerCase();
  }

  public getPublicKey({ privateKey: inputPrivateKey }: { privateKey: string }) {
    //    const privateKey = addPrefix0x(p);
    const privateKey = inputPrivateKey.startsWith("0x")
      ? inputPrivateKey.slice(2)
      : inputPrivateKey;
    if (privateKey.length !== 64) {
      throw new Error("Invalid private key");
    }
    const privateKeyBuffer = Buffer.from(privateKey, "hex");
    const publicKeyUINT8Array = secp256k1
      .publicKeyCreate(privateKeyBuffer, false)
      .slice(1);
    if (publicKeyUINT8Array.length !== 64) {
      throw new Error("Invalid public key");
    }

    const publicKey = Buffer.from(publicKeyUINT8Array);
    return publicKey.toString("hex").toLowerCase();
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

    return Buffer.from(publicKey).toString("hex");
  }

  public async signMessage({
    privateKey: inputPrivateKey,
    message: inputMessage,
  }: {
    privateKey: string;
    message: string;
  }) {
    const privateKey = new Uint8Array(Buffer.from(inputPrivateKey, "hex"));
    if (privateKey.length !== 32) {
      throw new Error("Invalid privatekey");
    }
    const message = new Uint8Array(
      createKeccakHash("keccak256")
        .update(Buffer.from(inputMessage, "hex"))
        .digest()
    );

    if (message.length !== 32) {
      throw new Error("Invalid message length");
    }

    const { signature, recid: r } = secp256k1.ecdsaSign(message, privateKey);
    return {
      fullSignature: `${Buffer.from(signature).toString("hex")}0${r}`,
      signature,
      r,
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
    ).toString("hex");
  }
}
