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

  public overwrite(index: number, buffer: Buffer) {
    for (let i = 0; i < buffer.length; i++) {
      this.buffer[i + index] = buffer[i];
    }
  }

  public get raw() {
    return this.buffer;
  }
}
