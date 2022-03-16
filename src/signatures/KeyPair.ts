import secp256k1 from "secp256k1";
import createKeccakHash from "keccak";

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
}
