import { RlpDecoder } from "./decode";

describe("RlpDecoder", () => {
  it("it should decode non values", () => {
    expect(
      new RlpDecoder().parse({
        input: "0x80",
      })
    ).toBe("");
  });
});
