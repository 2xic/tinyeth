import { DecodeAuthEip8 } from './auth/DecodeAuthEip8';
import { injectable } from 'inversify';

@injectable()
export class Auth8Eip {
  constructor(private _decodeAuthEip8: DecodeAuthEip8) {}

  public async decodeAuthEip8({ input }: { input: Buffer }) {
    return this._decodeAuthEip8.decodeAuthEip8({ input });
  }

  public async decodeAckEip8({ input }: { input: Buffer }) {
    return this._decodeAuthEip8.decodeAckEip8({ input });
  }
}
