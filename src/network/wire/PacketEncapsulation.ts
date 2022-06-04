import { KeyPath, sign } from 'ecies-geth';
import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Signatures } from '../../signatures/Signatures';
import { keccak256 } from '../../utils/keccak256';

@injectable()
export class PacketEncapsulation {
  constructor(private signatures: Signatures, private keypair: KeyPair) {}

  public encapsulate({ message }: { message: Buffer }) {
    // ping
    const packetType = 0x1;
    const coreMessage = Buffer.concat([Buffer.from([packetType]), message]);
    const signature = this.signatures.signMessage({
      message: keccak256(coreMessage),
      privateKey: this.keypair.privatekey,
    });
    const fullsignature = Buffer.from(signature.fullSignature, 'hex');
    const hash = keccak256(Buffer.concat([fullsignature, coreMessage]));

    const encodedMessage = Buffer.concat([hash, fullsignature, coreMessage]);
    return encodedMessage;
  }
}
