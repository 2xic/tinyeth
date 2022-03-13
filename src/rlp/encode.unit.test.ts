import { RlpEncoder } from "./encode";

describe("RlpEncoder", () => {
  it("should correctly encode booleans", () => {
    expect(
      new RlpEncoder().encode({
        input: true,
      })
    ).toBe("0x01");

    expect(
      new RlpEncoder().encode({
        input: false,
      })
    ).toBe("0x80");
  });

  it("should correctly encode falsy values", () => {
    expect(
      new RlpEncoder().encode({
        input: [],
      })
    ).toBe("0xc0");

    expect(
      new RlpEncoder().encode({
        input: "",
      })
    ).toBe("0x80");

    expect(
      new RlpEncoder().encode({
        input: 0,
      })
    ).toBe("0x80");
  });

  it("should correctly encode numbers", () => {
    expect(
      new RlpEncoder().encode({
        input: 127,
      })
    ).toBe("0x7f");

    expect(
      new RlpEncoder().encode({
        input: 128,
      })
    ).toBe("0x8180");
  });
});
