import { injectable } from 'inversify';
import { ChainInformation } from '../../ChainInformation';
import crc32 from 'crc-32';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { resetConfigureGlobal } from 'fast-check';
import { SignedUnsignedNumberConverter } from '../../../evm/SignedUnsignedNumberConverter';
import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../../../rlp';

@injectable()
export class ForkId {
  constructor(
    private chainInformation: ChainInformation,
    private rlp: RlpEncoder
  ) {}

  public get forkId() {
    return this.getForkId({
      hashBuffer: getBufferFromHex(
        this.chainInformation.chainInformation.genesisHash
      ),
    });
  }

  public calculate({
    hash = this.chainInformation.chainInformation.genesisHash,
    next = this.chainInformation.chainInformation.nextForkBlock,
    providedForkId = false,
  }: {
    hash?: string | number;
    next?: string | number;
    providedForkId?: boolean;
  }) {
    const padding = (data: Buffer) => {
      if (data.length < 4) {
        return Buffer.concat([
          getBufferFromHex(data),
          Buffer.alloc(4 - data.length),
        ]);
      }
      return data;
    };

    const hashBuffer = padding(getBufferFromHex(hash));

    const forkId = !providedForkId
      ? this.getForkId({ hashBuffer })
      : hashBuffer;
    return [getBufferFromHex(forkId), next];
  }

  private getForkId({ hashBuffer }: { hashBuffer: Buffer }) {
    const converter = new SignedUnsignedNumberConverter();
    const results = converter
      .convert(new BigNumber(crc32.buf(hashBuffer)))
      .toString(16)
      .slice(-8);

    return results;
  }
}
