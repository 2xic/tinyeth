import { KeyPair } from "./KeyPair";
import createKeccakHash from "keccak";

describe("KeyPair", () => {
  it("should be able to create public key from private key", () => {
    // random address created by https://www.pwall.org/ethereum/
    const privateKey =
      "0x840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a";
    const publicKey = new KeyPair().getPublicKey({
      privateKey,
    });
    const address = "0x4d5eB0Cd62351dF703BF707077e8e7c6525a1397".toLowerCase();

    expect(
      new KeyPair().getAddress({
        publicKey,
      })
    ).toBe(address);
  });

  it("should be able to sign and verify", async () => {
    const { signature, r, message } = await new KeyPair().signMessage({
      privateKey:
        "840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a",
      message: "test",
    });

    const signaturePublicKEy = await new KeyPair().verifyMessage({
      message,
      signature,
      r,
    });

    const actualPublicKey = await new KeyPair().getPublicKey({
      privateKey:
        "840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a",
    });
    expect(signaturePublicKEy).toBe(actualPublicKey);
  });

  it("should have matching signature as other implementations", async () => {
    // https://github.com/miguelmota/ethereum-development-with-go-book/blob/master/en/signature-verify/README.md

    const { signature, r, message, fullSignature } =
      await new KeyPair().signMessage({
        privateKey:
          "fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19",
        message: Buffer.from("hello", "ascii").toString("hex"),
      });

    expect(Buffer.from(message).toString("hex")).toBe(
      "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
    );
    expect(fullSignature).toBe(
      "789a80053e4927d0a898db8e065e948f5cf086e32f9ccaa54c1908e22ac430c62621578113ddbb62d509bf6049b8fb544ab06d36f916685a2eb8e57ffadde02301"
    );

    const publicKey = await new KeyPair().getPublicKeyFromSignature({
      message,
      signature,
      r,
    });

    const publicKey2 = await new KeyPair().getPublicKey({
      privateKey:
        "fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19",
    });

    expect(publicKey2).toBe(publicKey);
  });
});
