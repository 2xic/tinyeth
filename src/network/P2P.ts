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

  public get privateKey() {
    return this.keypair.privatekey;
  }

  public get ip() {
    return 'localhost';
  }

  public get port() {
    return 3000;
  }
}
