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

    expect(
      new RlpEncoder().encode({
        input: 256,
      })
    ).toBe("0x820100");

    expect(
      new RlpEncoder().encode({
        input: 1024,
      })
    ).toBe("0x820400");

    expect(
      new RlpEncoder().encode({
        input: 0xFFFFFF,
      })
    ).toBe("0x83ffffff");


    expect(
      new RlpEncoder().encode({
        input: 0xFFFFFFFF,
      })
    ).toBe("0x84ffffffff");

    expect(
      new RlpEncoder().encode({
        input: 0xFFFFFFFF,
      })
    ).toBe("0x84ffffffff");

  });

  it("should correctly encoded strings", () => {
    expect(
      new RlpEncoder().encode({
        input: "dog",
      })
    ).toBe("0x83646f67");

    expect(
      new RlpEncoder().encode({
        input: "hello world",
      })
    ).toBe("0x8b68656c6c6f20776f726c64");
  });

  it("should correctly encode a list of words", () => {
    expect(
      new RlpEncoder().encode({
        input: ["hello", "world"],
      })
    ).toBe("0xcc8568656c6c6f85776f726c64");
  });

  it("should correctly encode a long list", () => {
    const aEncoded = [...new Array(1024)].map(() => "61").join("");
    expect(
      new RlpEncoder().encode({
        input: [...new Array(1024)].map(() => "a").join(""),
      })
    ).toBe("0xb90400" + aEncoded);
  });
});
