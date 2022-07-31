export class SimpleBuffers {
  private buffer = Buffer.alloc(0);

  public concat(other: Buffer) {
    this.buffer = Buffer.concat([this.buffer, other]);
  }

  public build(): Buffer {
    return this.buffer;
  }

  public get length() {
    return this.buffer.length;
  }
}
