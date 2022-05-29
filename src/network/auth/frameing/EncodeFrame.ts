import { injectable } from 'inversify';
import { RlpEncoder } from '../../../rlp/RlpEncoder';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import crypto from 'crypto';
import { createAes256CtrDecipher } from './createAes256CtrDecipher';
import { MacInteractor } from './MacInteractor';

@injectable()
export class EncodeFrame {
  private _egressAes?: crypto.Decipher;

  private _egressMac?: MacInteractor;

  public setup({
    aesKey,
    mac,
  }: {
    aesKey: Buffer;
    mac: { nonce: Buffer; packet: Buffer; macKey: Buffer };
  }) {
    this._egressAes = createAes256CtrDecipher({ key: aesKey });
    this._egressMac = new MacInteractor(mac.macKey, mac.nonce, mac.packet);
  }

  public encodeHeader({ message }: { message: Buffer }) {
    const size = message.length;
    const buf = Buffer.allocUnsafe(3);
    buf.writeIntBE(size, 0, 3);

    // [capability-id, context-id]
    const headerData = getBufferFromHex(
      new RlpEncoder().encode({ input: [0, 0] })
    );

    const header = Buffer.concat([buf, headerData]);
    const padding = Buffer.alloc(16 - (header.length % 16));

    const headerPadding = Buffer.concat([header, padding]);

    const encrypted = this.egressAes.update(headerPadding);
    this.egressMac.header({ packet: encrypted });
    return Buffer.concat([encrypted, this.egressMac.slicedHash]);
  }

  public encodeBody({ message }: { message: Buffer }) {
    const padding = Buffer.alloc(16 - (message.length % 16));

    const body = Buffer.concat([message, padding]);
    const encrypted = this.egressAes.update(body);
    this.egressMac.body({ packet: encrypted });

    return Buffer.concat([encrypted, this.egressMac.slicedHash]);
  }

  public get egressAes() {
    if (!this._egressAes) {
      throw new Error('Setup has not been executed');
    }
    return this._egressAes;
  }

  public get egressMac() {
    if (!this._egressMac) {
      throw new Error('Setup has not been executed');
    }
    return this._egressMac;
  }
}
