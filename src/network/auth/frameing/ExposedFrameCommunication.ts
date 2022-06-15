import { injectable } from 'inversify';
import { DecodeFrame } from './DecodeFrame';
import { EncodeFrame } from './EncodeFrame';
import { FrameCommunication } from './FrameCommunication';
import { Logger } from '../../../utils/Logger';

@injectable()
export class ExposedFrameCommunication extends FrameCommunication {
  constructor(
    protected encodeFrame: EncodeFrame,
    protected decodeFrame: DecodeFrame,
    protected logger: Logger
  ) {
    super(encodeFrame, decodeFrame, logger);
  }

  public get options() {
    return this.initializedOptions;
  }

  public async ingressMacUpdate({ text }: { text: string }) {
    this.decodeFrame.ingressMac.update({
      packet: Buffer.from(text, 'ascii'),
    });

    return this.decodeFrame.ingressMac.fullHash.toString('hex');
  }
}
