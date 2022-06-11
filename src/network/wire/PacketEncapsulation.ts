import { injectable } from 'inversify';
import { KeyPair } from '../../signatures/KeyPair';
import { Signatures } from '../../signatures/Signatures';
import { assertEqual } from '../../utils/enforce';
import { keccak256 } from '../../utils/keccak256';

@injectable()
export class PacketEncapsulation {
  constructor(private signatures: Signatures, private keyPair: KeyPair) {}

  public encapsulate({
    message,
    packetType,
  }: {
    message: Buffer;
    packetType: Buffer;
  }) {
    const signature = this.signatures.signMessage({
      message: keccak256(Buffer.concat([packetType, message])),
      privateKey: this.keyPair.privatekey,
    });
    const fullSignature = Buffer.from(signature.fullSignature, 'hex');
    assertEqual(fullSignature.length, 65, 'Invalid signature length');

    const hash = keccak256(Buffer.concat([fullSignature, packetType, message]));
    const header = Buffer.concat([hash, fullSignature, packetType]);

    const encodedMessage = Buffer.concat([header, message]);
    // https://github.com/openethereum/parity-ethereum/issues/8038
    const parityHash = keccak256(encodedMessage.slice(98)).toString('hex');

    return { encodedMessage, hash, parityHash };
  }
}
