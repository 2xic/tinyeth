import { MacInteractor } from './MacInteractor';
import crypto from 'crypto';
import { assertEqual } from '../../../utils/enforce';
import { createAes256CtrDecipher } from './createAes256CtrDecipher';
import { injectable } from 'inversify';

@injectable()
export class DecodeFrame {
  private _ingressMac?: MacInteractor;
  private _ingresAes?: crypto.Decipher;

  public setup({
    aesKey,
    mac,
  }: {
    aesKey: Buffer;
    mac: { nonce: Buffer; packet: Buffer; macKey: Buffer };
  }) {
    this._ingresAes = createAes256CtrDecipher({ key: aesKey });
    this._ingressMac = new MacInteractor(mac.macKey, mac.nonce, mac.packet);
  }

  public parseBody({ message, size }: { message: Buffer; size: number }) {
    const body = message.slice(32, -16);
    const mac = message.slice(-16);
    this.ingressMac.body({
      packet: body,
    });

    assertEqual(
      mac.toString('hex'),
      this.ingressMac.slicedHash.toString('hex')
    );

    const decryptedBody = this.ingresAes.update(body).slice(0, size);

    return decryptedBody;
  }

  public parseHeader({ message }: { message: Buffer }) {
    const header = message.slice(0, 16);
    const mac = message.slice(16, 32);
    this.ingressMac.header({
      packet: header,
    });
    assertEqual(
      mac.toString('hex'),
      this.ingressMac.slicedHash.toString('hex')
    );
    const decryptedHeader = this.ingresAes.update(header);

    return decryptedHeader.slice(0, 3);
  }

  public get ingresAes() {
    if (!this._ingresAes) {
      throw new Error('Setup has not been executed');
    }
    return this._ingresAes;
  }

  public get ingressMac() {
    if (!this._ingressMac) {
      throw new Error('Setup has not been executed');
    }
    return this._ingressMac;
  }

  public get ingressMacMacHash() {
    return this.ingressMac.slicedHash.toString('hex');
  }
}
