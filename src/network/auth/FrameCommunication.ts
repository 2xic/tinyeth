import { MacInteractor } from './MacInteractor';
import crypto from 'crypto';
import { keccak256 } from '../keccak256';
import { buffer2int } from '@ethereumjs/devp2p';
import { MessageTwoTone } from '@mui/icons-material';
import { assertEqual } from '../../utils/enforce';

export class FrameCommunication {
  private _ingressMac?: MacInteractor;
  private _egressMac?: MacInteractor;

  private ingresAes: crypto.Decipher;
  private egressAes: crypto.Decipher;

  private macKey: Buffer;

  constructor(
    empheralSharedSecret: Buffer,
    initiatorNonce: Buffer,
    receiverNonce: Buffer
  ) {
    const nonce = keccak256(Buffer.concat([receiverNonce, initiatorNonce]));

    const aesKey = keccak256(Buffer.concat([empheralSharedSecret, nonce]));

    this.macKey = keccak256(Buffer.concat([empheralSharedSecret, aesKey]));

    this.ingresAes = createDeciper({
      key: aesKey,
    });
    this.egressAes = createDeciper({
      key: aesKey,
    });
  }

  public setup({
    secret,
    remoteNonce,
    initiatorNonce,
    remotePacket,
    initiatorPacket,
  }: {
    secret: Buffer;
    remoteNonce: Buffer;
    initiatorNonce: Buffer;
    remotePacket: Buffer;
    initiatorPacket: Buffer;
  }) {
    this.setupEgressMac({
      secret,
      nonce: remoteNonce,
      packet: initiatorPacket,
    });
    this.setupIngresMac({
      secret,
      nonce: initiatorNonce,
      packet: remotePacket,
    });

    return this;
  }

  private setupEgressMac({
    secret,
    nonce,
    packet,
  }: {
    secret: Buffer;
    nonce: Buffer;
    packet: Buffer;
  }) {
    this._egressMac = new MacInteractor(this.macKey, nonce, packet);
  }

  private setupIngresMac({
    secret,
    nonce,
    packet,
  }: {
    secret: Buffer;
    nonce: Buffer;
    packet: Buffer;
  }) {
    this._ingressMac = new MacInteractor(this.macKey, nonce, packet);
  }

  public parse({ message }: { message: Buffer }) {
    const header = message.slice(0, 16);
    const mac = message.slice(16, 32);
    this.ingressMac.header({
      packet: header,
    });
    assertEqual(
      mac.toString('hex'),
      this.ingressMac.slicedHash.toString('hex')
    );
    console.log('hm :)');
  }

  public get ingressMac(): MacInteractor {
    if (!this._ingressMac) {
      throw new Error('Mac interactor not setup :/');
    }
    return this._ingressMac;
  }
}

function createDeciper({ key }: { key: Buffer }) {
  const iv = Buffer.from([...new Array(16)].map(() => 0));

  return crypto.createDecipheriv('aes-256-ctr', key, iv);
}
