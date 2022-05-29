import { createKeccak256 } from '../keccak256';
import { xor } from '../XorBuffer';
import crypto from 'crypto';

export class MacInteractor {
  private hash = createKeccak256();

  constructor(private macSecret: Buffer, nonce: Buffer, packet: Buffer) {
    this.hash.update(Buffer.concat([xor(macSecret, nonce), packet]));
  }

  public header({ packet }: { packet: Buffer }) {
    const encrypted = this.cipher.update(this.slicedHash);
    this.hash.update(xor(encrypted, packet));
  }

  public body({ packet }: { packet: Buffer }) {
    this.hash.update(packet);
    const currentHash = this.slicedHash;
    const encrypted = this.cipher.update(currentHash);
    this.hash.update(xor(encrypted, currentHash));
  }

  private get cipher() {
    return crypto.createCipheriv('aes-256-ecb', this.macSecret, '');
  }

  public get slicedHash(): Buffer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.hash as any)._clone().digest().slice(0, 16);
  }
}
