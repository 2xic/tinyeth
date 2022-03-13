export class RlpDecoder {
  public parse({ input }: { input: string }): string | undefined {
    const strippedInput = input.substring(2).match(/.{1,2}/g);
    const parsed = (
      strippedInput?.map((c) => {
        return String.fromCharCode(parseInt(c, 16));
      }) || []
    ).join();
    return this._parse({ input: parsed });
  }

  private _parse({ input }: { input: string }): string | undefined {
    if (!input.length) {
      return undefined;
    }
    const { offset, length, type } = this.decode({ input });

    let output = "";
    if (type == "string") {
      output = input.substr(offset, length);
    } else if (type === "list") {
      output = Array(length).fill(0).toString();
    }
    return (
      output + (this._parse({ input: input.substr(offset + length) }) || "")
    );
  }

  private decode({ input }: { input: string }) {
    const length = input.length;
    if (length === 0) {
      throw new Error("input is null");
    }
    const prefix = input.charCodeAt(0);

    if (prefix <= 0x7f) {
      return {
        offset: 0,
        length: 1,
        type: "string",
      };
    } else if (prefix <= 0xb7 && length - prefix - 0x80) {
      return {
        offset: 1,
        length: prefix - 0x80,
        type: "string",
      };
    } else if (
      prefix <= 0xb7 &&
      length > prefix - 0xb7 &&
      length > prefix - 0xb7 + this.toInteger(input.substr(1, prefix - 0xb7))
    ) {
      const offset = prefix - 0xb7;
      const length = this.toInteger(input.substr(1, prefix - 0xb7));

      return {
        offset: 1 + offset,
        length: length,
        type: "string",
      };
    } else if (prefix <= 0xf7 && length > prefix - 0xc0) {
      const length = prefix - 0xc0;
      return {
        offset: 1,
        length,
        type: "list",
      };
    } else if (
      prefix <= 0xff &&
      length > prefix - 0xf7 &&
      length > prefix - 0xf7 + this.toInteger(input.substr(1, prefix - 0xf7))
    ) {
      const offset = prefix - 0xf7;
      const length = this.toInteger(input.substr(1, offset));
      return {
        offset: 1 + offset,
        length,
        type: "list",
      };
    } else {
      throw new Error("Illegal input");
    }
  }

  private toInteger(input: string): number {
    return Buffer.from(input, "hex").readInt8();
  }
}
