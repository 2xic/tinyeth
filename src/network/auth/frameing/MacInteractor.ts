import { createKeccak256 } from '../../../utils/keccak256';
import { xor } from '../../../utils/XorBuffer';
import crypto from 'crypto';
import { assertEqual } from '../../../utils/enforce';

export class MacInteractor {
  private hash = createKeccak256();

  constructor(private macSecret: Buffer, nonce: Buffer, packet: Buffer) {
    assertEqual(Buffer.isBuffer(macSecret), true);
    assertEqual(Buffer.isBuffer(nonce), true);
    assertEqual(Buffer.isBuffer(packet), true);
    this.update({
      packet: Buffer.concat([xor(macSecret, nonce), packet]),
    });
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

  public update({ packet }: { packet: Buffer }) {
    this.hash.update(packet);
  }

  private get cipher() {
    return crypto.createCipheriv('aes-256-ecb', this.macSecret, '');
  }

  public get slicedHash(): Buffer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.hash as any)._clone().digest().slice(0, 16);
  }

  public get fullHash(): Buffer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.hash as any)._clone().digest();
  }
}
