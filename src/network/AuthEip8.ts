import { decode } from '@ethereumjs/devp2p';
import { RlpDecoder } from '../rlp/RlpDecoder';
import { ReadOutRlp } from '../rlp/ReadOutRlp';
import { Rlpx } from './Rlpx';
import { DecodeAuthEip8 } from './auth/DecodeAuthEip8';

export class Auth8Eip {
  constructor(private rlpx: Rlpx) {}

  public async decodeAuthEip8({ input }: { input: Buffer }) {
    return new DecodeAuthEip8(this.rlpx).decodeAuthEip8({ input });
  }

  public async decodeAckEip8({ input }: { input: Buffer }) {
    return new DecodeAuthEip8(this.rlpx).decodeAckEip8({ input });
  }
}
