import { injectable } from 'inversify';
import { KeyPair } from '../../signatures';

@injectable()
export class NodeId {
  constructor(private keyPair: KeyPair) {}

  public get nodeId() {
    return this.keyPair.getPublicKey(); //{ privateKey: 'deadbeef'.repeat(8) });
  }
}
