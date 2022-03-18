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
});
