import BigNumber from "bignumber.js";
import { Transactions } from "./Transaction";

describe("Transaction", () => {
  it("should be able to construct a raw transaction", () => {
    // example from https://ethereum.stackexchange.com/a/87309
    const transaction = new Transactions()
      .construct({
        nonce: 0x1e7,
        gasprice: new BigNumber("0x2e90edd000"),
        startgas: 0x30d40,
        to: new BigNumber("0xbd064928cdd4fd67fb99917c880e6560978d7ca1"),
        value: new BigNumber("0xde0b6b3a7640000"),
        data: "",
      })
      .encode();

    expect(transaction).toBe(
      "0xec8201e7852e90edd00083030d4094bd064928cdd4fd67fb99917c880e6560978d7ca1880de0b6b3a764000080"
    );
  });

  it("should correctly sign an transaction", () => {
    // example from https://medium.com/portis/part-three-creating-and-signing-ethereum-transactions-e9cca44d7e2d
    const transaction = new Transactions()
      .construct({
        nonce: 0x1e7,
        gasprice: new BigNumber("0x2e90edd000"),
        startgas: 0x30d40,
        to: new BigNumber("0xbd064928cdd4fd67fb99917c880e6560978d7ca1"),
        value: new BigNumber("0xde0b6b3a7640000"),
        data: "",
      })
      .signed({
        privateKey:
          "616E6769652E6A6A706572657A616775696E6167612E6574682E6C696E6B0D0A",
      });

    expect(transaction).toBe(
      "0xf86f8201e7852e90edd00083030d4094bd064928cdd4fd67fb99917c880e6560978d7ca1880de0b6b3a7640000801ca08029fda98d0c934c36078788937886dedb95be54c16c2bdf023033851b221d67a07e37b1ddf372c531f5b8f13f5f530a040ee32ad8f87d95f49a047d3c4db5d05b"
    );
  });
});
