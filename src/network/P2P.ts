import { KeyPair } from '../signatures/KeyPair';

export class P2P {
  constructor(private keypair: KeyPair) {}

  public get enode(): string {
    const publicKey = this.keypair.getPublicKey();
    if (publicKey.length !== 128) {
      throw new Error('Wrong length');
    }
    return `enode://${publicKey}@${this.ip}:${this.port}`;
  }

  public parseEncode(enode: string): {
    publicKey: string;
    address: string;
    port: number;
  } {
    const [publicKey, ip] = enode.split('@');
    const [address, port] = ip.split(':');

    return {
      publicKey,
      address,
      port: Number(port),
    };
  }

  public get ip() {
    throw new Error('Not implemented');
  }

  public get port() {
    throw new Error('Not implemented');
  }
}
