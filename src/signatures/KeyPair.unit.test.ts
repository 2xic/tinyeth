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
});
