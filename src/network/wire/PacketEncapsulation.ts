import { KeyPath, sign } from 'ecies-geth';
import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Signatures } from '../../signatures/Signatures';
import { assertEqual } from '../../utils/enforce';
import { keccak256 } from '../../utils/keccak256';

@injectable()
export class PacketEncapsulation {
  constructor(private signatures: Signatures, private keypair: KeyPair) {}

  public encapsulate({
    message,
    packetType,
  }: {
    message: Buffer;
    packetType: Buffer;
  }) {
    const signature = this.signatures.signMessage({
      message: keccak256(Buffer.concat([packetType, message])),
      privateKey: this.keypair.privatekey,
    });
    const fullSignature = Buffer.from(signature.fullSignature, 'hex');
    assertEqual(fullSignature.length, 65, 'Invalid signature length');

    const hash = keccak256(Buffer.concat([fullSignature, packetType, message]));
    const header = Buffer.concat([hash, fullSignature, packetType]);

    const encodedMessage = Buffer.concat([header, message]);
    return encodedMessage;
  }
}
