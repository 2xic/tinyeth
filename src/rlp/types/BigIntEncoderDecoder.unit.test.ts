import { BigIntEncoderDecoder } from "./BigIntEncoderDecoder";

describe("BigInt", () => {
  it("should be able to represent bigint", () => {
    // cross reference https://github.com/ethereum/go-ethereum/blob/master/rlp/encode_test.go
    const { encoding } = new BigIntEncoderDecoder().encode({
      input: "102030405060708090A0B0C0D0E0F2",
    });
    expect(encoding).toBe("8f102030405060708090a0b0c0d0e0f2");
  });
});
