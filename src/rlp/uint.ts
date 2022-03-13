export class Uint {
  public encodeNumber(input: number): Response {
    const isUint8 = input < (1 << 8);

    if (isUint8) {
      const bytes = new Uint8Array([
        input
      ]);
      /*
      bytes[0] = input;
      bytes.set([input], 0);
      */
      return {
        bytes,
        length: 1,
      };
    }
    throw new Error("Not implemented");
  }
}

interface Response {
  bytes: Uint8Array;
  length: number;
}
