import BigNumber from "bignumber.js";
import { BigIntEncoderDecoder } from "./BigIntEncoderDecoder";

describe("BigInt", () => {
  // cross reference https://github.com/ethereum/go-ethereum/blob/master/rlp/encode_test.go
  it.each([
    {
      input: "102030405060708090A0B0C0D0E0F2",
      output: "8f102030405060708090a0b0c0d0e0f2",
    },
    {
      input: "0100020003000400050006000700080009000A000B000C000D000E01",
      output:
        "9C0100020003000400050006000700080009000A000B000C000D000E01".toLocaleLowerCase(),
    },
    {
      input:
        "010000000000000000000000000000000000000000000000000000000000000000",
      output:
        "a1010000000000000000000000000000000000000000000000000000000000000000",
    },
  ])("should be able to represent bigint", ({ input, output }) => {
    const { encoding } = new BigIntEncoderDecoder().encode({
      input,
    });
    console.log(encoding);
    expect(encoding).toBe(output);
  });
});
