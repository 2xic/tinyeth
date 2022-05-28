import { MacInteractor } from './MacInteractor';
import crypto from 'crypto';
import { keccak256 } from '../keccak256';
import { buffer2int } from '@ethereumjs/devp2p';
import { MessageTwoTone } from '@mui/icons-material';
import { assertEqual } from '../../utils/enforce';
import { bufferToInt } from 'ethereumjs-util';
import { RlpEncoder } from '../../rlp/RlpEncoder';
import { getBufferFromHex } from '../getBufferFromHex';

export class FrameCommunication {
  private _ingressMac?: MacInteractor;
  private _egressMac?: MacInteractor;

  private ingresAes: crypto.Decipher;
  private egressAes: crypto.Decipher;

  private macKey: Buffer;

  constructor(
    empheralSharedSecret: Buffer,
    private initiatorNonce: Buffer,
    private receiverNonce: Buffer
  ) {
    const nonce = keccak256(Buffer.concat([receiverNonce, initiatorNonce]));

    const nonceEmpheral = keccak256(
      Buffer.concat([empheralSharedSecret, nonce])
    );
    console.log(empheralSharedSecret);
    console.log(nonce);
    console.log(nonceEmpheral);

    const aesKey = keccak256(
      Buffer.concat([empheralSharedSecret, nonceEmpheral])
    );

    this.macKey = keccak256(Buffer.concat([empheralSharedSecret, aesKey]));

    console.log(this.macKey);

    this.ingresAes = createDeciper({
      key: aesKey,
    });
    this.egressAes = createDeciper({
      key: aesKey,
    });
  }

  public setup({
    remotePacket,
    initiatorPacket,
  }: {
    remotePacket: Buffer;
    initiatorPacket: Buffer;
  }) {
    this.setupIngresMac({
      nonce: this.initiatorNonce,
      packet: remotePacket,
    });
    this.setupEgressMac({
      nonce: this.receiverNonce,
      packet: initiatorPacket,
    });

    return this;
  }

  private setupEgressMac({ nonce, packet }: { nonce: Buffer; packet: Buffer }) {
    this._egressMac = new MacInteractor(this.macKey, nonce, packet);
  }

  private setupIngresMac({ nonce, packet }: { nonce: Buffer; packet: Buffer }) {
    this._ingressMac = new MacInteractor(this.macKey, nonce, packet);
  }

  public encode({ message }: { message: Buffer }) {
    const header = this.encodeHeader({ message });
    const body = this.encodeBody({ message });

    return Buffer.concat([header, body]);
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
    const padding = Buffer.from(
      [...new Array(16 - (header.length % 16))].map(() => 0)
    );

    const headerPadding = Buffer.concat([header, padding]);

    console.log(headerPadding);

    const encrypted = this.egressAes.update(headerPadding);
    if (!this._egressMac) {
      throw new Error('Wrong egress');
    }
    this._egressMac.header({ packet: encrypted });
    return Buffer.concat([encrypted, this._egressMac.slicedHash]);
  }

  public encodeBody({ message }: { message: Buffer }) {
    const padding = Buffer.from(
      [...new Array(16 - (message.length % 16))].map(() => 0)
    );

    const body = Buffer.concat([message, padding]);
    const encrypted = this.egressAes.update(body);
    if (!this._egressMac) {
      throw new Error('Wrong egress');
    }
    this._egressMac.body({ packet: encrypted });

    return Buffer.concat([encrypted, this._egressMac.slicedHash]);
  }

  public parse({ message }: { message: Buffer }) {
    const header = this.parseHeader({ message });
    const body = this.parseBody({
      message,
      size: (header[0] << 16) + (header[1] << 8) + header[2],
    });

    return body;
  }

  private parseBody({ message, size }: { message: Buffer; size: number }) {
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

  private parseHeader({ message }: { message: Buffer }) {
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
