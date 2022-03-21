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
        nonce: 0x00,
        gasprice: new BigNumber("0x3b9aca00"),
        startgas: 0x5208,
        to: new BigNumber("0x17A98d2b11Dfb784e63337d2170e21cf5DD04631"),
        value: new BigNumber("0x16345785d8a0000"),
        data: "",
      })
      .signed({
        privateKey:
          "616E6769652E6A6A706572657A616775696E6167612E6574682E6C696E6B0D0A",
        chainId: 1,
      });

    expect(transaction).toBe(
      "0xf86b80843b9aca008252089417a98d2b11dfb784e63337d2170e21cf5dd0463188016345785d8a00008025a02e47aa4c37e7003af4d3b7d20265691b6c03baba509c0556d21acaca82876cb4a01b5711b8c801584c7875370ed2e9b60260b390cdb63cf57fa6d77899102279a0"
    );
  });
});
