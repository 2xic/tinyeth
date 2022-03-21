import { RlpDecoder } from "./RlpDecoder";

describe("RlpDecoder", () => {
  it("it should decode non values", () => {
    expect(
      new RlpDecoder().parse({
        input: "0x80",
      })
    ).toBe("");
  });

  it("should decode numbers", () => {
    expect(
      new RlpDecoder().parse({
        input: "0x05",
      })
    ).toBe("5");
  });

  it("should correctly decode a list", () => {
    expect(
      new RlpDecoder().parse({
        input: "0xC50102030405",
      })
    ).toBe(JSON.stringify([1, 2, 3, 4, 5]));
  });
});
